"use client";

import { useState } from "react";
import { CardSignInButton } from "@/components/form/Buttons";
import ProductBuyBox from "@/components/single-product/product-buy-box";
import ProductGallery from "@/components/single-product/product-gallery";
import ProductKeyFacts from "@/components/single-product/product-key-facts";
import ProductDetailsTabs from "@/components/single-product/product-details-tabs";
import ProductEquipmentList from "@/components/single-product/product-equipment-list";
import ProductRelated from "@/components/single-product/product-related";
import ProductSpecs from "@/components/single-product/product-specs";
import ProductStickyCta from "@/components/single-product/product-sticky-cta";
import ShareButton from "@/components/single-product/ShareButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LuFileText, LuShoppingCart } from "react-icons/lu";
import type { VehicleCardModel } from "@/components/vehicles/vehicle-card";

const DEMO_IMAGES = [
  { src: "/images/hero.webp", alt: "MAN TGX — front" },
  { src: "/images/hero.png", alt: "MAN TGX — alternate" },
  { src: "/images/hero.webp", alt: "MAN TGX — detail" },
];

const DEMO_FACTS = [
  { key: "make", label: "Марка", value: "MAN" },
  { key: "model", label: "Модель", value: "TGX 18.440" },
  { key: "year", label: "Рік", value: "2019" },
  { key: "mileage", label: "Пробіг", value: "540 000 км" },
  { key: "power_hp", label: "Потужність", value: "440 к.с." },
  { key: "euro", label: "Євронорма", value: "Euro 6" },
  { key: "transmission", label: "КПП", value: "Автомат" },
  { key: "axle", label: "Колісна формула", value: "4×2" },
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
    <Button type="button" size="lg" className="w-full">
      <LuShoppingCart className="size-4" aria-hidden />
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
          Канон PDP hero. Buy-box без sticky; price+CTA+trust одразу під
          key facts (без `mt-auto`). 2 CTA: замовлення + заявка. Mobile
          sticky CTA — демо-бар нижче.
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

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
        <div className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden">
          <ProductGallery images={DEMO_IMAGES} />
        </div>
        <ProductBuyBox
          className="min-w-0"
          categoryLabel="Сідельні тягачі"
          name="MAN TGX 18.440"
          priceLabel="€ 38 500"
          priceHint="ціна з ПДВ"
          availabilityLabel="В наявності"
          availabilityInStock
          facts={DEMO_FACTS}
          articleLabel="Артикул DEMO-TGX-18440"
          financingLabel="Фінансування від"
          financingAmount="≈ € 755/міс"
          financingHint="Лізинг або кредит · орієнтовний розрахунок"
          trustItems={[
            { id: "warranty", label: "Гарантія 12 місяців" },
            { id: "service", label: "Сервісне обслуговування" },
            { id: "delivery", label: "Доставка по Україні та ЄС" },
            {
              id: "tradein",
              label: "Trade-in",
              hint: "Обмін вашої техніки",
            },
          ]}
          actions={
            <>
              <CardSignInButton appearance="outline" />
              <ShareButton productId="ui-lab-pdp" name="MAN TGX 18.440" />
            </>
          }
          cta={<DemoCta />}
          secondaryCta={
            <Button type="button" size="lg" variant="outline" className="w-full">
              <LuFileText className="size-4" aria-hidden />
              Залишити заявку
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

      <ProductDetailsTabs
        textHeading="Про автомобіль"
        tabs={[
          {
            id: "description",
            name: "Опис",
            kind: "TEXT",
            body: "Демо-опис: перевірена техніка з Європи, підготовка на власному СТО, супровід угоди.\n\nТекст іде після buy-box — не між ціною й CTA.",
          },
          {
            id: "specs",
            name: "Детальні характеристики",
            kind: "TABLE",
            groups: DEMO_SPEC_GROUPS,
          },
          {
            id: "equipment",
            name: "Комплектація",
            kind: "LIST",
            items: [
              "ABS",
              "Клімат-контроль",
              "Тахограф",
              "Підігрів дзеркал",
              "Круїз-контроль",
              "Ел. склопідйомники",
            ],
          },
        ]}
      />

      <div className="grid gap-3">
        <h3 className="text-sm font-semibold tracking-tight">
          LIST canon (комплектація)
        </h3>
        <p className="text-sm text-muted-foreground">
          Канон PDP tab kind=LIST — ProductEquipmentList: Specs-ритм (column-major
          1/2/3 col, divide-y), маркер LuCheck у muted square.
        </p>
        <div className="rounded-sm border border-border bg-card p-4 md:p-6">
          <ProductEquipmentList
            items={[
              "ABS",
              "Клімат-контроль",
              "Тахограф",
              "Підігрів дзеркал",
              "Круїз-контроль",
              "Ел. склопідйомники",
            ]}
          />
        </div>
      </div>

      <div className="grid gap-3">
        <h3 className="text-sm font-semibold tracking-tight">
          Specs fallback (flat, без табів)
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
        catalogHref="/products?folder=furhony"
        catalogLabel="Перейти в каталог"
        catalogHint="Більше пропозицій у категорії Фургони"
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
