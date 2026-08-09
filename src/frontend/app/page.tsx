"use client";

import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import Icon from "@/components/ui/Icon";
import {
  CONTENT,
  CATEGORY_PRESENTATION,
  ROUTES,
  SITE,
} from "@/lib/site-config";
import { useStorefront } from "@/lib/StorefrontContext";

export default function HomePage() {
  const { products, categories, config, catalogState, retryCatalog } =
    useStorefront();
  const featured = products.filter((product) => product.featured);
  const heroProduct = featured[0];

  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <p className="eyebrow">{CONTENT.home.eyebrow}</p>
          <h1>{CONTENT.home.title}</h1>
          <p className="hero-intro">{CONTENT.home.intro}</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href={ROUTES.products}>
              {CONTENT.common.shopNow}
              <Icon name="arrow" size={18} />
            </Link>
            <a className="btn btn-secondary" href="#buying-guide">
              {CONTENT.home.secondaryAction}
            </a>
          </div>
          <dl className="hero-facts">
            <div>
              <dt>{CONTENT.home.paymentFact}</dt>
              <dd>{CONTENT.home.paymentFactValue}</dd>
            </div>
            <div>
              <dt>{CONTENT.home.catalogFact}</dt>
              <dd>
                {products.length
                  ? CONTENT.home.catalogFactValue(products.length)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>{CONTENT.home.deliveryFact}</dt>
              <dd>
                {config?.shippingMethods[0]?.label ?? CONTENT.home.loadingRule}
              </dd>
            </div>
          </dl>
        </div>
        <div className="hero-product" aria-live="polite">
          {heroProduct ? (
            <Link href={ROUTES.product(heroProduct.id)}>
              <span className="hero-product-label">
                {CONTENT.home.featuredPick}
              </span>
              <img
                src={heroProduct.images[0]!.src}
                alt={heroProduct.images[0]!.alt}
                width={640}
                height={480}
              />
              <strong>{heroProduct.name}</strong>
              <span>{heroProduct.shortDescription}</span>
            </Link>
          ) : (
            <div className="hero-product-loading" aria-busy="true">
              {CONTENT.home.featuredLoading}
            </div>
          )}
        </div>
      </section>

      <section
        className="section-shell category-section"
        aria-labelledby="category-title"
      >
        <header className="section-heading">
          <p className="eyebrow">{CONTENT.home.categoriesEyebrow}</p>
          <h2 id="category-title">{CONTENT.home.categoriesTitle}</h2>
        </header>
        {catalogState === "error" ? (
          <div className="inline-error" role="alert">
            <p>{CONTENT.home.catalogUnavailable}</p>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={retryCatalog}
            >
              {CONTENT.common.retry}
            </button>
          </div>
        ) : (
          <div className="category-grid">
            {categories.map((category) => {
              const presentation = CATEGORY_PRESENTATION[category.id];
              return (
                <Link
                  key={category.id}
                  href={ROUTES.category(category.id)}
                  className="category-card"
                >
                  <span className="category-icon">
                    <Icon
                      name={
                        presentation.icon as
                          "scope" | "binoculars" | "accessories"
                      }
                      size={26}
                    />
                  </span>
                  <span className="eyebrow">{presentation.eyebrow}</span>
                  <h3>{category.label}</h3>
                  <p>{category.description}</p>
                  <strong>
                    {CONTENT.home.categoryCount(category.count)}{" "}
                    <Icon name="arrow" size={17} />
                  </strong>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section
        className="section-shell featured-section"
        aria-labelledby="featured-title"
      >
        <header className="section-heading heading-row">
          <div>
            <p className="eyebrow">{CONTENT.home.featuredEyebrow}</p>
            <h2 id="featured-title">{CONTENT.home.featuredTitle}</h2>
          </div>
          <Link href={ROUTES.products} className="text-link">
            {CONTENT.home.viewCollection}
            <Icon name="arrow" size={17} />
          </Link>
        </header>
        <ProductGrid
          products={featured}
          loading={catalogState === "loading"}
          skeletonCount={4}
          emptyTitle={CONTENT.home.featuredEmpty}
          emptyDesc={CONTENT.home.featuredEmptyBody}
          emptyAction={CONTENT.common.shopNow}
          emptyActionHref={ROUTES.products}
        />
      </section>

      <section id="buying-guide" className="buying-guide section-shell">
        <div>
          <p className="eyebrow">{CONTENT.home.guideEyebrow}</p>
          <h2>{CONTENT.home.guideTitle}</h2>
          <p>{CONTENT.home.guideBody}</p>
          <Link className="btn btn-primary" href={ROUTES.products}>
            {CONTENT.home.compareCollection}
            <Icon name="arrow" size={18} />
          </Link>
        </div>
        <div className="guide-options">
          {CONTENT.home.guideOptions.map((option) => (
            <article key={option.title}>
              <Icon
                name={option.icon as "binoculars" | "scope" | "accessories"}
                size={26}
              />
              <h3>{option.title}</h3>
              <p>{option.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="service-strip"
        aria-label={CONTENT.home.principlesLabel}
      >
        <div>
          <Icon name="shield" />
          <strong>{CONTENT.home.principles.paymentTitle}</strong>
          <span>{CONTENT.home.principles.paymentBody}</span>
        </div>
        <div>
          <Icon name="truck" />
          <strong>{CONTENT.home.principles.deliveryTitle}</strong>
          <span>
            {config?.shippingMethods[0]?.description ??
              CONTENT.home.principles.deliveryLoading}
          </span>
        </div>
        <div>
          <Icon name="package" />
          <strong>{CONTENT.home.principles.pricingTitle}</strong>
          <span>{CONTENT.home.principles.pricingBody}</span>
        </div>
      </section>
      <span className="sr-only">{SITE.name}</span>
    </>
  );
}
