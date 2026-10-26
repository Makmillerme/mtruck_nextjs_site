"use client";

import { useState } from "react";
import { CardSignInButton } from "@/components/form/Buttons";
import ProductBuyBox from "@/components/single-product/product-buy-box";
import ProductGallery from "@/components/single-product/product-gallery";
import ProductKeyFacts from "@/components/single-product/product-key-facts";
import ProductRelated from "@/components/single-product/product-related";
import ProductSpecs from "@/components/single-product/product-specs";
import ProductStickyCta from "@/components/single-product/product-sticky-cta";
import ShareButton from "@/components/single-product/ShareButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { VehicleCardModel } from "@/components/vehicles/vehicle-card";

const DEMO_IMAGES = [
  { src: "/images/hero.webp", alt: "MAN TGX — front" },
  { src: "/images/hero.png", alt: "MAN TGX — alternate" },
  { src: "/images/hero.webp", alt: "MAN TGX — detail" },
];

const DEMO_FACTS = [
  { key: "year", label: "Рік", value: "2019" },
  { key: "mileage", label: "Пробіг", value: "540 000 км" },
  { key: "power", label: "Потужність", value: "440 к.с." },
  { key: "transmission", label: "КПП", value: "Автомат" },
  { key: "fuel", label: "Паливо", value: "Дизель" },
  { key: "euro", label: "Euro", value: "Euro 6" },
];

const DEMO_SPEC_GROUPS = [
  {
    id: "base",
    title: "Базові",
    rows: [
      { id: "1", label: "Марка", value: "MAN" },
      { id: "2", label: "Модель", value: "TGX 18.440" },
      { id: "3", label: "Рік", value: "2019" },
      { id: "4", label: "Пробіг", value: "540 000 км" },
    ],
  },
  {
    id: "tech",
    title: "Техніка",
    rows: [
      { id: "5", label: "Потужність", value: "440 к.с." },
      { id: "6", label: "КПП", value: "Автомат" },
      { id: "7", label: "Euro", value: "Euro 6" },
      { id: "8", label: "Осі", value: "4×2" },
    ],
  },
];

const DEMO_RELATED: VehicleCardModel[] = [
  {
    id: "pdp-rel-1",
    name: "Scania R450",
    price: 42000,
    image: "/images/hero.webp",
    images: ["/images/hero.webp"],
    href: "/products",
    status: "PUBLISHED",
    year: 2018,
    categoryLabel: "Сідельні тягачі",
    specItems: [
      { key: "mileage", label: "Пробіг", value: "610 000 км" },
      { key: "euro", label: "Euro", value: "Euro 6" },
    ],
  },
  {
    id: "pdp-rel-2",
    name: "Volvo FH460",
    price: 45500,
    image: "/images/hero.webp",
    images: ["/images/hero.webp"],
    href: "/products",
    status: "PUBLISHED",
    year: 2020,
    categoryLabel: "Сідельні тягачі",
    specItems: [
      { key: "mileage", label: "Пробіг", value: "380 000 км" },
      { key: "euro", label: "Euro", value: "Euro 6" },
    ],
  },
  {
    id: "pdp-rel-3",
    name: "Mercedes Actros 1845",
    price: 39800,
    image: "/images/hero.webp",
    images: ["/images/hero.webp"],
    href: "/products",
    status: "PUBLISHED",
    year: 2017,
    categoryLabel: "Сідельні тягачі",
    specItems: [
      { key: "mileage", label: "Пробіг", value: "720 000 км" },
      { key: "euro", label: "Euro", value: "Euro 5" },
    ],
  },
  {
    id: "pdp-rel-4",
    name: "DAF XF 480",
    price: 41200,
    image: "/images/hero.webp",
    images: ["/images/hero.webp"],
    href: "/products",
    status: "PUBLISHED",
    year: 2019,
    categoryLabel: "Сідельні тягачі",
    specItems: [
      { key: "mileage", label: "Пробіг", value: "540 000 км" },
      { key: "euro", label: "Euro", value: "Euro 6" },
    ],
  },
  {
    id: "pdp-rel-5",
    name: "MAN TGX 18.500",
    price: 44100,
    image: "/images/hero.webp",
    images: ["/images/hero.webp"],
    href: "/products",
    status: "PUBLISHED",
    year: 2021,
    categoryLabel: "Сідельні тягачі",
    specItems: [
      { key: "mileage", label: "Пробіг", value: "290 000 км" },
      { key: "euro", label: "Euro", value: "Euro 6" },
    ],
  },
  {
    id: "pdp-rel-6",
    name: "Iveco S-Way",
    price: 36500,
    image: "/images/hero.webp",
    images: ["/images/hero.webp"],
    href: "/products",
    status: "PUBLISHED",
    year: 2018,
    categoryLabel: "Сідельні тягачі",
    specItems: [
      { key: "mileage", label: "Пробіг", value: "680 000 км" },
      { key: "euro", label: "Euro", value: "Euro 6" },
    ],
  },
];

function DemoCta() {
  return (
    <Button type="button" size="lg">
      Замовити це авто
    </Button>
  );
}

export default function UiLabPdp() {
  const [showSticky, setShowSticky] = useState(true);

  return (
    <div className="grid gap-10">
      <div className="grid gap-2">
        <p className="text-sm text-muted-foreground">
          Канон PDP. Галерея+lightbox — секція PhotoCarousel (ProductGallery).
          Тут: sticky buy-box, key facts без іконок, CTA lg+outline, specs,
          related. Mobile sticky CTA — демо-бар нижче.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">z-40 sticky CTA</Badge>
          <Badge variant="outline">header z-50</Badge>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setShowSticky((value) => !value)}
          >
            Sticky CTA: {showSticky ? "on" : "off"}
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={DEMO_IMAGES} />
        <ProductBuyBox
          categoryLabel="Сідельні тягачі"
          name="MAN TGX 18.440"
          priceLabel="€ 38 500"
          priceHint="ціна з ПДВ"
          availabilityLabel="В наявності"
          availabilityInStock
          facts={DEMO_FACTS}
          actions={
            <>
              <CardSignInButton appearance="outline" />
              <ShareButton productId="ui-lab-pdp" name="MAN TGX 18.440" />
            </>
          }
          cta={<DemoCta />}
          secondaryCta={
            <Button type="button" size="lg" variant="outline">
              Зателефонувати
            </Button>
          }
        />
      </div>

      <div className="grid gap-2">
        <h3 className="text-sm font-semibold tracking-tight">
          Key facts (strip variant)
        </h3>
        <ProductKeyFacts facts={DEMO_FACTS} title="Ключові параметри" />
      </div>

      <p className="max-w-3xl leading-7 text-foreground/90">
        Демо-опис: перевірена техніка з Європи, підготовка на власному СТО,
        супровід угоди. Текст іде після buy-box — не між ціною й CTA.
      </p>

      <ProductSpecs groups={DEMO_SPEC_GROUPS} title="Характеристики" />

      <div className="grid gap-3">
        <h3 className="text-sm font-semibold tracking-tight">
          Specs fallback (flat)
        </h3>
        <ProductSpecs
          groups={[
            {
              id: "flat",
              title: "",
              rows: DEMO_SPEC_GROUPS.flatMap((group) => group.rows),
            },
          ]}
          title="Характеристики"
        />
      </div>

      <ProductRelated
        title="Схожі товари"
        vehicles={DEMO_RELATED}
        catalogHref="/products"
        catalogLabel="Перейти до каталогу"
        catalogHint="Більше пропозицій у каталозі"
        carouselPrevLabel="Попереднє"
        carouselNextLabel="Наступне"
      />

      {showSticky ? (
        <ProductStickyCta priceLabel="€ 38 500" cta={<DemoCta />} />
      ) : null}

      {showSticky ? <div className="h-16 lg:hidden" aria-hidden /> : null}
    </div>
  );
}
