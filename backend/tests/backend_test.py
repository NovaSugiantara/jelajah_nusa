"""Backend tests for the Stage 1 Jelajah Nusa API.

Requires a running server backed by MongoDB. Set BASE_URL to the running API
(e.g. http://localhost:8000) or provide REACT_APP_BACKEND_URL.
"""

import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8000").rstrip("/")
API = f"{BASE_URL}/api"

STAGE1_SLUGS = {"aceh", "bali"}
ALLOWED_ORIGIN = "http://localhost:3000"


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json", "Origin": ALLOWED_ORIGIN})
    return sess


def _reset_session(sess):
    sess.cookies.clear()


def _advance_to_choice(s, slug):
    """Walk scenes until a choice node, then choose c1, returning forward response."""
    region = s.get(f"{API}/regions/{slug}").json()
    node = region["story"]["start"]
    while True:
        n = region["story"]["nodes"][node]
        if n["type"] == "choice":
            res = s.post(
                f"{API}/progress/forward",
                json={"region_slug": slug, "expected_node": node, "choice_id": "c1"},
            ).json()
            return res, region
        res = s.post(f"{API}/progress/forward", json={"region_slug": slug, "expected_node": node}).json()
        node = res["node_id"]


# ---------------- /api/regions ----------------

class TestRegions:
    def test_list_regions_is_stage1(self, s):
        _reset_session(s)
        r = s.get(f"{API}/regions")
        assert r.status_code == 200
        data = r.json()
        assert data["total"] == 2
        assert {reg["slug"] for reg in data["regions"]} == STAGE1_SLUGS
        for reg in data["regions"]:
            assert "thumbnail" in reg and "alt" in reg["thumbnail"]
            assert "draft" in reg

    @pytest.mark.parametrize("slug", ["bali", "aceh"])
    def test_region_story_graph(self, s, slug):
        r = s.get(f"{API}/regions/{slug}")
        assert r.status_code == 200
        data = r.json()
        assert data["slug"] == slug
        nodes = data["story"]["nodes"]
        assert data["story"]["start"] in nodes
        choice_nodes = [n for n in nodes.values() if n["type"] == "choice"]
        assert len(choice_nodes) == 1
        assert len(choice_nodes[0]["choices"]) == 2
        discoveries = [n for n in nodes.values() if n["type"] == "discovery"]
        assert len(discoveries) == 2
        for d in discoveries:
            assert d.get("fact")
            assert d.get("sources") and d["sources"][0].get("url")
            assert d.get("review") and d["review"].get("status")

    def test_region_not_found(self, s):
        r = s.get(f"{API}/regions/jawa-tengah")
        assert r.status_code == 404

    def test_region_outside_stage1_hidden(self, s):
        r = s.get(f"{API}/regions/papua")
        assert r.status_code == 404


# ---------------- /api/progress ----------------

class TestProgress:
    def test_creates_session_cookie_and_empty_progress(self, s):
        _reset_session(s)
        r = s.get(f"{API}/progress")
        assert r.status_code == 200
        assert "jelajah_nusa_session" in s.cookies.get_dict()
        d = r.json()
        assert d["provinces"]["aceh"]["status"] == "not_started"
        assert d["provinces"]["bali"]["status"] == "not_started"

    def test_session_isolation(self, s):
        _reset_session(s)
        s.get(f"{API}/progress")
        s.post(f"{API}/progress/start", json={"region_slug": "bali"})

        other = requests.Session()
        other.headers.update({"Content-Type": "application/json", "Origin": ALLOWED_ORIGIN})
        other.get(f"{API}/progress")
        assert other.get(f"{API}/progress").json()["provinces"]["bali"]["status"] == "not_started"

    def test_full_flow_commits_completion_once(self, s):
        _reset_session(s)
        s.get(f"{API}/progress")
        s.post(f"{API}/progress/start", json={"region_slug": "aceh"})

        # Walk scenes then choose -> Discovery, completion committed.
        res, region = _advance_to_choice(s, "aceh")
        assert res["progress"]["provinces"]["aceh"]["status"] == "completed"
        assert res["progress"]["provinces"]["aceh"]["collectibleOwned"] is True
        assert res["newly_collected"] is not None
        assert res["newly_collected"]["id"] == "col-aceh"

        # Retry a transition after committed completion: idempotent, no duplicate.
        choice_node = next(nid for nid, n in region["story"]["nodes"].items() if n["type"] == "choice")
        retry = s.post(
            f"{API}/progress/forward",
            json={"region_slug": "aceh", "expected_node": choice_node, "choice_id": "c1"},
        ).json()
        assert retry["newly_collected"] is None
        assert retry["progress"]["provinces"]["aceh"]["collectibleOwned"] is True
        assert retry["progress"]["provinces"]["aceh"]["lastDiscoveryId"] is not None

    def test_restart_preserves_completion(self, s):
        _reset_session(s)
        s.get(f"{API}/progress")
        s.post(f"{API}/progress/start", json={"region_slug": "bali"})
        _advance_to_choice(s, "bali")

        d = s.post(f"{API}/progress/restart", json={"region_slug": "bali"}).json()["progress"]
        # Completion is preserved; the replay run is active alongside it.
        assert d["provinces"]["bali"]["status"] == "completed"
        assert d["provinces"]["bali"]["activeRun"] is not None
        assert d["provinces"]["bali"]["collectibleOwned"] is True
        assert d["provinces"]["bali"]["completedAt"] is not None

    def test_forward_without_run_rejected(self, s):
        _reset_session(s)
        s.get(f"{API}/progress")
        r = s.post(f"{API}/progress/forward", json={"region_slug": "aceh", "expected_node": "s1"})
        assert r.status_code == 409

    def test_stale_expected_node_rejected(self, s):
        _reset_session(s)
        s.get(f"{API}/progress")
        s.post(f"{API}/progress/start", json={"region_slug": "aceh"})
        r = s.post(f"{API}/progress/forward", json={"region_slug": "aceh", "expected_node": "wrong-node"})
        assert r.status_code == 409


# ---------------- Security -----------------

class TestSecurity:
    def test_disallowed_origin_rejected(self):
        sess = requests.Session()
        sess.headers.update({"Content-Type": "application/json", "Origin": "https://evil.example"})
        sess.get(f"{API}/progress")
        r = sess.post(f"{API}/progress/start", json={"region_slug": "aceh"})
        assert r.status_code == 403
