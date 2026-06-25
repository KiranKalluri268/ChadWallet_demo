"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { clsx } from "@/lib/format";

type FlowItem = {
  src: string;
  alt: string;
};

type Slot = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  zIndex: number;
  opacity: number;
};

const flowItems: FlowItem[] = [
  { src: "/flow/buy-sell-4.png", alt: "Buy and sell trending tokens" },
  { src: "/flow/launch-4.png", alt: "Launch a memecoin" },
  { src: "/flow/portfolio-4.png", alt: "Manage assets" },
  { src: "/flow/relaunch-4.png", alt: "Relaunch a memecoin" }
];

const slots: Slot[] = [
  { x: 282, y: 0, width: 520, height: 292, rotate: 0, zIndex: 30, opacity: 1 },
  { x: 0, y: 118, width: 330, height: 185, rotate: -4, zIndex: 12, opacity: 0.78 },
  { x: 754, y: 118, width: 330, height: 185, rotate: 4, zIndex: 12, opacity: 0.78 },
  { x: 372, y: 258, width: 340, height: 191, rotate: 0, zIndex: 10, opacity: 0.72 }
];

const initialSlotByItem = [0, 1, 2, 3];

export function DesktopFlowShowcase() {
  const [slotByItem, setSlotByItem] = useState(initialSlotByItem);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const animatingRef = useRef(false);
  const slotByItemRef = useRef(initialSlotByItem);

  useLayoutEffect(() => {
    cardRefs.current.forEach((card, itemIndex) => {
      if (!card) return;
      gsap.set(card, slotTween(slots[slotByItemRef.current[itemIndex]]));
    });
  }, []);

  function focusItem(clickedItemIndex: number) {
    if (animatingRef.current) return;

    const currentSlotByItem = slotByItemRef.current;
    const clickedSlotIndex = currentSlotByItem[clickedItemIndex];
    if (clickedSlotIndex === 0) return;

    const activeItemIndex = currentSlotByItem.findIndex((slotIndex) => slotIndex === 0);
    const activeCard = cardRefs.current[activeItemIndex];
    const clickedCard = cardRefs.current[clickedItemIndex];

    if (!activeCard || !clickedCard) return;

    animatingRef.current = true;
    gsap.killTweensOf([activeCard, clickedCard]);

    activeCard.style.zIndex = "25";
    clickedCard.style.zIndex = "35";

    const timeline = gsap.timeline({
      defaults: { duration: 0.42, ease: "power3.out" },
      onComplete: () => {
        const nextSlotByItem = currentSlotByItem.map((slotIndex, itemIndex) => {
          if (itemIndex === clickedItemIndex) return 0;
          if (itemIndex === activeItemIndex) return clickedSlotIndex;
          return slotIndex;
        });

        slotByItemRef.current = nextSlotByItem;
        setSlotByItem(nextSlotByItem);
        gsap.set(clickedCard, slotTween(slots[0]));
        gsap.set(activeCard, slotTween(slots[clickedSlotIndex]));
        cardRefs.current.forEach((card, itemIndex) =>
          card ? gsap.set(card, { zIndex: slots[nextSlotByItem[itemIndex]].zIndex }) : undefined
        );
        animatingRef.current = false;
      }
    });

    timeline
      .to(clickedCard, slotTween(slots[0]), 0)
      .to(activeCard, slotTween(slots[clickedSlotIndex]), 0);
  }

  return (
    <div className="relative hidden min-h-[36rem] w-full max-w-[67.75rem] lg:block">
      {flowItems.map((item, itemIndex) => {
        const slotIndex = slotByItem[itemIndex];
        const isActive = slotIndex === 0;

        return (
          <button
            key={item.src}
            ref={(node) => {
              cardRefs.current[itemIndex] = node;
            }}
            type="button"
            onClick={() => focusItem(itemIndex)}
            onMouseEnter={() => previewTilt(itemIndex, true)}
            onMouseLeave={() => previewTilt(itemIndex, false)}
            className={clsx(
              "absolute left-0 top-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] p-0 text-left shadow-2xl outline-none transition hover:border-acid/50",
              isActive ? "focused-flow-card cursor-default" : "cursor-pointer"
            )}
            aria-label={isActive ? `${item.alt} is focused` : `Focus ${item.alt}`}
          >
            <Image
              src={item.src}
              alt={item.alt}
              width={isActive ? 900 : 520}
              height={760}
              className={clsx("h-full w-full object-cover", isActive ? "opacity-100" : "opacity-80")}
            />
          </button>
        );
      })}
    </div>
  );

  function previewTilt(itemIndex: number, entering: boolean) {
    if (animatingRef.current) return;

    const slotIndex = slotByItemRef.current[itemIndex];
    if (slotIndex === 0) return;

    const card = cardRefs.current[itemIndex];
    if (!card) return;

    const slot = slots[slotIndex];
    gsap.to(card, {
      rotation: entering ? slot.rotate * 1.45 : slot.rotate,
      scale: entering ? 1.035 : 1,
      duration: 0.22,
      ease: "power3.out"
    });
  }
}

function applySlot(element: HTMLElement, slot: Slot, duration: number) {
  gsap.to(element, { ...slotTween(slot), duration, ease: "power3.out" });
}

function slotTween(slot: Slot) {
  return {
    x: slot.x,
    y: slot.y,
    width: slot.width,
    height: slot.height,
    rotation: slot.rotate,
    opacity: slot.opacity,
    zIndex: slot.zIndex
  };
}
