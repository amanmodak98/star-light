# 01 — Site Overview

**Source:** https://beautyartlights.com · **Platform:** custom PHP storefront (Laravel-style Blade
templates, Bootstrap 4 + a bespoke "foxic" commerce theme)

## Brand

| Field | Value |
|---|---|
| Name | Beauty Art Lights |
| Site title / tagline | Beauty Art Lights Bulk |
| Copyright | ©2024 Beauty Art Lights |
| Positioning | "Beauty Art Lights **Bulk**" — B2B / wholesale decorative lighting |
| Self-description | Manufacturers of lamp lights; indoor + outdoor lamps, lighting and handmade decorations for homes and hotels; customisation offered |

## Contact

| Channel | Value |
|---|---|
| Email | sales@beautyartlights.com |
| WhatsApp | +911332351546 |
| Website | www.beautyartlights.com |
| Contact-page promise | "We typically reply in 24-48 hours" |
| Bulk enquiry | Per-product "Enquiry for bulk" modal + a "For Bulk" nav item |

There is **no published phone number** and **no physical address** anywhere on the site.

## Navigation tree (as shipped)

- **Home** → ``
- **Categories** → `javascript:void(0);`
- **Wall Clocks** → `/category/all-lighting/categories/wall-clocks`
- **Mirror Lights** → `/category/all-lighting/categories/mirror-lights`
- **Hanging Lights** → `/category/all-lighting/categories/hanging-lights`
- **Floor Lamps** → `/category/all-lighting/categories/floor-lamps`
- **Table Lamps** → `/category/all-lighting/categories/table-lamps`
- **Tripod Floor Lamps** → `/category/all-lighting/categories/tripod-floor-lamps`
- **Table Tripod Lamps** → `/category/all-lighting/categories/table-tripod-lamps`
- **Chandelier Lights** → `/category/all-lighting/categories/chandelier-lights`
- **Wall Lights** → `/category/all-lighting/categories/wall-light`
- **Vertical Lights** → `/category/all-lighting/categories/vertical-lights`
- **Horizontal Lights** → `/category/all-lighting/categories/horizontal-lights`
- **About Us** → `/pages/about-us`
- **All Products** → `/category/all-lighting`
- **Contact us** → `/pages/contact-us`
- **For Bulk** → `#`

> Note: the nav dropdown lists 11 subcategories, but the mega-menu is inconsistent —
> "Wall Clocks" and "Mirror Lights" are listed in the header dropdown and are also
> reachable from the footer, while "Table Tripod Lamps" appears twice. See
> `02-category-taxonomy.md` for the authoritative map.

## Commerce model

- **No prices are published.** Every product renders `price-new` as `$ 0` (and on
  14 products literally `$ -2` — a bug in the source data, not a real price).
- The primary conversion is the **"Enquiry for bulk"** modal: a per-product
  question + email form, plus a `buy_now` POST endpoint.
- Secondary conversion: **WhatsApp** float button (+911332351546).
- There is a cart/checkout/account shell (`/cart`, `/checkout`, `/login`,
  `/registration`) but no functioning priced cart.

## About Us (verbatim extract)

page-content">
About Us
We are presenting you a wonderful art of lamp and lighting.
Introducing Our Craftsmanship in Lighting: Customizable Lamp Lights
We are manufacturers of lamp lights.
We can customize any type of lighting.
Our main products are indoor and outdoor lamps, lighting, and other handmade decorations for homes and hotels.
At Beauty Art Lights, we take immense pride in our craft, transforming mere spaces into illuminating works of art. As manufacturers of lamp lights, we understand that lighting is not just about illuminating a room; it's about creating an ambiance, an atmosphere, and a sense of warmth. With our commitment to craftsmanship and innovation, we craft custom lighting solutions to cater to your unique needs, desires, and visions.
Unveiling Our Specialization
Our spectrum of offerings is as diverse as the lighting needs of our customers. Our main products include:
1. Indoor Lamps:
From the cozy glow of a bedside table lamp to the artistic elegance of a pendant lamp, we craft indoor lighting that complements your home's aesthetics. Whether your style leans toward modern, vintage, minimalist, or extravagant, our team of artisans can design the perfect indoor lamp to elevate your interior spaces.
2. Outdoor Lamps:
Outdoor lighting is not just about function; it's about creating an inviting outdoor environment. Our outdoor lamps are designed to blend seamlessly with your garden, patio, or porch, providing not only illumination but also a touch of elegance. Illuminate your outdoor spaces with our durable and stylish outdoor lamp solutions.
3. Handmade decorations:
Beyond lamps, we create stunning handmade decorations that are sure to add a unique and artistic touch to your homes and hotels. These handmade pieces range from intricately designed chandeliers to beautifully crafted wall sconces, each a testament to the skill and creativity of our artisans.
Customization: Your Vision, Our Craftsmanship
At Beauty Art Lights, we firmly believe that lighting should be a reflection of your personality and style. That's why we offer a wide range of customization options. Share your ideas, inspirations, or requirements, and our team of experienced artisans and designers will work closely with you to bring your vision to life. Choose from an array of materials, colors, styles, and sizes to create lighting solutions that are uniquely yours.
Why choose us?
Quality Craftsmanship: Each piece we create is a labor of love, meticulously crafted to meet the highest standards of quality.
Endless Possibilities: Our customization options ensure that your lighting is a perfect match for your space and style.
Diverse Product Range: From indoor to outdoor lighting and decorative pieces, we have the lighting solution for every need.
Customer-Centric Approach: We prioritize your satisfaction and strive to make the process of creating custom lighting as smooth and enjoyable as possible.
Eco-Friendly Practices: We are committed to sustainability and use en

## Static pages captured

| Page | URL | Extracted chars |
|---|---|---|
| home | `/` | 1150 |
| about-us | `/pages/about-us` | 3594 |
| contact-us | `/pages/contact-us` | 869 |
| raise-an-issue | `/raise-an-issue` | 97 |
