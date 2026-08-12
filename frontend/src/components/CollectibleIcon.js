import React from "react";
import {
  Sword,
  Utensils,
  Drama,
  Shirt,
  Flower2,
  Shield,
  Sailboat,
  ShoppingBag,
  Stamp,
} from "lucide-react";

const MAP = {
  sword: Sword,
  utensils: Utensils,
  drama: Drama,
  shirt: Shirt,
  flower: Flower2,
  shield: Shield,
  sailboat: Sailboat,
  "shopping-bag": ShoppingBag,
};

export default function CollectibleIcon({ name, size = 28, ...props }) {
  const Icon = MAP[name] || Stamp;
  return <Icon size={size} {...props} />;
}
