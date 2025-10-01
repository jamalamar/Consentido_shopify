import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Consentido - Natural & Sustainable Marketplace'}];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    featuredCollection: collections.nodes[0],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="home" style={{
      padding: '0',
      maxWidth: '100%'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'linear-gradient(180deg, #faf8f5 0%, #f5f0eb 100%)',
        borderBottom: '1px solid #e0d4c5'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '300',
          letterSpacing: '0.08em',
          marginBottom: '1rem',
          color: '#312b24',
          textTransform: 'lowercase'
        }}>
          natural & sustainable
        </h1>
        <p style={{
          fontSize: '1rem',
          fontWeight: '300',
          color: '#6d6152',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.8',
          letterSpacing: '0.02em'
        }}>
          discover handcrafted, eco-friendly products made with care for you and the earth
        </p>
      </div>
      <FeaturedCollection collection={data.featuredCollection} />
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

function FeaturedCollection({
  collection,
}: {
  collection: FeaturedCollectionFragment;
}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
      style={{
        display: 'block',
        position: 'relative',
        margin: '3rem auto',
        maxWidth: '1400px',
        padding: '0 2rem'
      }}
    >
      {image && (
        <div className="featured-collection-image" style={{
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #e0d4c5'
        }}>
          <Image data={image} sizes="100vw" />
          <div style={{
            position: 'absolute',
            bottom: '2rem',
            left: '2rem',
            background: 'rgba(250, 248, 245, 0.92)',
            padding: '1.5rem 2.5rem',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(224, 212, 197, 0.8)'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '1.75rem',
              fontWeight: '300',
              letterSpacing: '0.08em',
              textTransform: 'lowercase',
              color: '#312b24'
            }}>
              {collection.title}
            </h2>
          </div>
        </div>
      )}
    </Link>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <div className="recommended-products" style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '3rem 2rem 5rem'
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '300',
        letterSpacing: '0.08em',
        textAlign: 'center',
        marginBottom: '2.5rem',
        color: '#312b24',
        textTransform: 'lowercase'
      }}>
        curated selection
      </h2>
      <Suspense fallback={
        <div style={{
          textAlign: 'center',
          color: '#a89b8c',
          fontSize: '0.9rem',
          padding: '3rem'
        }}>
          loading...
        </div>
      }>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
