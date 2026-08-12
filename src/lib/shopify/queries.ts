/* -------------------------------------------------------------------------- */
/*  STOREFRONT GRAPHQL DOCUMENTS                                              */
/* -------------------------------------------------------------------------- */

/** Everything the app needs to render a card or a full product page. */
export const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    vendor
    productType
    tags
    availableForSale
    createdAt
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 10) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    options {
      name
      values
    }
    variants(first: 100) {
      edges {
        node {
          id
          title
          sku
          availableForSale
          quantityAvailable @include(if: $includeInventory)
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
        }
      }
    }
    collections(first: 5) {
      edges {
        node {
          handle
          title
        }
      }
    }
  }
`;

export const PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query Products(
    $first: Int!
    $query: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $language: LanguageCode
    $includeInventory: Boolean!
  ) @inContext(language: $language) {
    products(
      first: $first
      query: $query
      sortKey: $sortKey
      reverse: $reverse
    ) {
      edges {
        node {
          ...ProductFields
        }
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query ProductByHandle(
    $handle: String!
    $language: LanguageCode
    $includeInventory: Boolean!
  )
  @inContext(language: $language) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
`;

export const COLLECTIONS_QUERY = /* GraphQL */ `
  query Collections($first: Int!, $language: LanguageCode)
  @inContext(language: $language) {
    collections(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          image {
            url
            altText
          }
        }
      }
    }
  }
`;

/** Homepage merchandising content stored on Shopify collections. */
export const HOMEPAGE_COLLECTIONS_QUERY = /* GraphQL */ `
  query HomepageCollections($language: LanguageCode)
  @inContext(language: $language) {
    tshirts: collection(handle: "t-shirts") {
      ...HomepageCollectionFields
    }
    outerwear: collection(handle: "jackets-coats") {
      ...HomepageCollectionFields
    }
    shoes: collection(handle: "shoes") {
      ...HomepageCollectionFields
    }
    accessories: collection(handle: "accessories") {
      ...HomepageCollectionFields
    }
    seasonal: collection(handle: "new-in") {
      ...HomepageCollectionFields
    }
  }

  fragment HomepageCollectionFields on Collection {
    handle
    title
    description
    image {
      url
      altText
    }
    seo {
      title
      description
    }
    metafield(namespace: "custom", key: "homepage_content") {
      value
    }
  }
`;

/* --------------------------------- cart ---------------------------------- */

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              sku
              selectedOptions {
                name
                value
              }
              price {
                amount
                currencyCode
              }
              image {
                url
                altText
              }
              product {
                handle
                title
                vendor
              }
            }
          }
        }
      }
    }
  }
`;

export const CART_CREATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_QUERY = /* GraphQL */ `
  ${CART_FRAGMENT}
  query Cart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
`;
