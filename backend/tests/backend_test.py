"""Backend tests for Jelajah Nusa API."""
import os
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # Try frontend env file
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip()
BASE_URL = BASE_URL.rstrip("/")

EXPECTED_SLUGS = {
    "aceh", "sumatera-barat", "dki-jakarta", "yogyakarta",
    "bali", "kalimantan-barat", "sulawesi-selatan", "papua",
}


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# ---------------- /api/regions ----------------

class TestRegions:
    def test_list_regions(self, s):
        r = s.get(f"{BASE_URL}/api/regions")
        assert r.status_code == 200
        data = r.json()
        assert data["total"] == 8
        slugs = {reg["slug"] for reg in data["regions"]}
        assert slugs == EXPECTED_SLUGS
        for reg in data["regions"]:
            for k in ("slug", "name", "collectible", "map", "storyTitle"):
                assert k in reg, f"missing {k} in {reg['slug']}"
            assert "id" in reg["collectible"] and "name" in reg["collectible"]
            assert "x" in reg["map"] and "y" in reg["map"]

    @pytest.mark.parametrize("slug", ["bali", "aceh"])
    def test_region_story_graph(self, s, slug):
        r = s.get(f"{BASE_URL}/api/regions/{slug}")
        assert r.status_code == 200
        data = r.json()
        assert data["slug"] == slug
        story = data["story"]
        nodes = story["nodes"]
        assert story["start"] in nodes
        # find choice node
        choice_nodes = [n for n in nodes.values() if n["type"] == "choice"]
        assert len(choice_nodes) >= 1
        ch = choice_nodes[0]
        assert len(ch["choices"]) == 2
        # two discoveries reachable
        discoveries = [n for n in nodes.values() if n["type"] == "discovery"]
        assert len(discoveries) == 2
        for d in discoveries:
            assert d.get("fact") and d.get("source")

    def test_region_not_found(self, s):
        r = s.get(f"{BASE_URL}/api/regions/unknown-slug-xyz")
        assert r.status_code == 404


# ---------------- /api/progress ----------------

class TestProgress:
    def _sid(self):
        return f"TEST_{uuid.uuid4().hex[:12]}"

    def test_get_empty_progress(self, s):
        sid = self._sid()
        r = s.get(f"{BASE_URL}/api/progress/{sid}")
        assert r.status_code == 200
        d = r.json()
        assert d["regions_explored"] == []
        assert d["regions_completed"] == []
        assert d["collectibles"] == []
        assert d["stats"]["completedCount"] == 0
        assert d["stats"]["level"]["title"] == "Musafir Baru"
        assert d["stats"]["nextMilestone"] == 2
        assert d["stats"]["milestones"] == [2, 4, 6, 8]

    def test_explore_then_complete_flow(self, s):
        sid = self._sid()
        # Explore only
        r = s.post(f"{BASE_URL}/api/progress", json={
            "session_id": sid, "region_slug": "bali", "story_completed": False
        })
        assert r.status_code == 200
        d = r.json()
        assert "bali" in d["regions_explored"]
        assert d["regions_completed"] == []
        assert d["newly_collected"] is None

        # Complete
        r = s.post(f"{BASE_URL}/api/progress", json={
            "session_id": sid, "region_slug": "bali",
            "story_completed": True, "choice_id": "c1", "discovery_id": "e1"
        })
        assert r.status_code == 200
        d = r.json()
        assert "bali" in d["regions_completed"]
        assert d["newly_collected"] is not None
        assert d["newly_collected"]["id"] == "col-bali"
        assert d["stats"]["completedCount"] == 1

        # Re-complete: should NOT duplicate
        r = s.post(f"{BASE_URL}/api/progress", json={
            "session_id": sid, "region_slug": "bali",
            "story_completed": True, "choice_id": "c2", "discovery_id": "e2"
        })
        assert r.status_code == 200
        d = r.json()
        assert d["newly_collected"] is None
        bali_cols = [c for c in d["collectibles"] if c["id"] == "col-bali"]
        assert len(bali_cols) == 1

        # GET persistence check
        r = s.get(f"{BASE_URL}/api/progress/{sid}")
        assert r.status_code == 200
        d = r.json()
        assert "bali" in d["regions_completed"]
        assert d["stats"]["completedCount"] == 1

    def test_invalid_region_slug(self, s):
        sid = self._sid()
        r = s.post(f"{BASE_URL}/api/progress", json={
            "session_id": sid, "region_slug": "unknown-xyz", "story_completed": False
        })
        assert r.status_code == 404

    def test_explorer_level_thresholds(self, s):
        """Verify level titles at completed counts 0,2,4,6,8."""
        sid = self._sid()
        slugs = ["aceh", "bali", "papua", "yogyakarta",
                 "dki-jakarta", "sumatera-barat", "kalimantan-barat", "sulawesi-selatan"]
        expected = {
            0: "Musafir Baru",
            2: "Penjelajah",
            4: "Penjelajah Ahli",
            6: "Penjaga Cerita",
            8: "Duta Nusantara",
        }
        # 0
        r = s.get(f"{BASE_URL}/api/progress/{sid}")
        assert r.json()["stats"]["level"]["title"] == expected[0]
        for i, slug in enumerate(slugs, start=1):
            r = s.post(f"{BASE_URL}/api/progress", json={
                "session_id": sid, "region_slug": slug,
                "story_completed": True, "choice_id": "c1", "discovery_id": "e1"
            })
            assert r.status_code == 200
            stats = r.json()["stats"]
            if i in expected:
                assert stats["level"]["title"] == expected[i], (
                    f"at count={i} expected {expected[i]} got {stats['level']['title']}"
                )
        # After 8 completed, nextMilestone should be None
        r = s.get(f"{BASE_URL}/api/progress/{sid}")
        assert r.json()["stats"]["nextMilestone"] is None
        assert r.json()["stats"]["completedCount"] == 8


# ---------------- /api/voice ----------------

class TestVoice:
    def test_voice_wall_seeded(self, s):
        r = s.get(f"{BASE_URL}/api/voice/wall")
        assert r.status_code == 200
        d = r.json()
        assert "prompt" in d and d["prompt"]
        assert isinstance(d["entries"], list)
        seed_entries = [e for e in d["entries"] if e.get("seed")]
        assert len(seed_entries) >= 5

    def test_voice_submit_pending_not_on_wall(self, s):
        sid = f"TEST_{uuid.uuid4().hex[:12]}"
        marker = f"TEST_MARKER_{uuid.uuid4().hex[:8]}"
        r = s.post(f"{BASE_URL}/api/voice", json={
            "session_id": sid, "answer": marker
        })
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "pending"

        # Wall should NOT contain this pending marker
        w = s.get(f"{BASE_URL}/api/voice/wall").json()
        texts = [e["answer_text"] for e in w["entries"]]
        assert marker not in texts

    def test_voice_submit_empty_rejected(self, s):
        r = s.post(f"{BASE_URL}/api/voice", json={
            "session_id": "TEST_x", "answer": ""
        })
        # Pydantic min_length=1 => 422
        assert r.status_code in (400, 422)
