import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';

export function ProductItem({
  product,
  loading,
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  return (
    <Link
      className="product-item"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
      style={{
        display: 'block',
        textDecoration: 'none',
        transition: 'transform 250ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {image && (
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '1rem',
          border: '1px solid #e0d4c5',
          background: '#fdfcfa'
        }}>
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
          />
        </div>
      )}
      <h4 style={{
        margin: '0 0 0.5rem 0',
        fontSize: '1rem',
        fontWeight: '300',
        letterSpacing: '0.05em',
        color: '#312b24',
        textTransform: 'lowercase'
      }}>
        {product.title}
      </h4>
      <small style={{
        fontSize: '0.875rem',
        color: '#6d6152',
        fontWeight: '300',
        letterSpacing: '0.02em'
      }}>
        <Money data={product.priceRange.minVariantPrice} />
      </small>
    </Link>
  );
}
