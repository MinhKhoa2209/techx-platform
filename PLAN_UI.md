# TechX Store — kế hoạch nâng cấp UI/UX và dữ liệu ecommerce

> Trạng thái: **READY TO PUSH — automated/local/container gates pass; browser visual gates waived by owner on 2026-08-09**  
> Phạm vi: `techx-platform` (Catalog API, Order API và Frontend/BFF)  
> Ngoài phạm vi: `techx-chart`, `techx-infra`, AWS, database, tài khoản người dùng và thanh toán thật  
> Quyết định dữ liệu: được phép thay toàn bộ catalog hiện tại; không cần migration hoặc tương thích dữ liệu cũ.

## 1. Mục tiêu và nguyên tắc

Mục tiêu là biến thin slice hiện tại thành một storefront demo có cảm giác ecommerce thật, mạch lạc và đáng tin cậy, nhưng vẫn giữ kiến trúc nhỏ gọn: catalog JSON tĩnh, order in-memory có TTL và chỉ public Frontend/BFF.

Nguyên tắc triển khai:

- Chỉ hiển thị dữ liệu và chức năng có nguồn thật trong API hoặc được ghi rõ là demo; không tạo rating, review, discount, stock, customer count hoặc trạng thái giao hàng giả.
- Không để control “trang trí” có vẻ tương tác được. Search, filter, promo, newsletter, wishlist và payment chỉ được hiện khi có hành vi hoàn chỉnh; nếu chưa làm thì bỏ khỏi UI.
- Giá, phí vận chuyển và tổng tiền phải dùng một nguồn tính toán duy nhất ở backend; frontend chỉ preview và luôn render kết quả order do server trả về.
- Không thu hoặc lưu số thẻ/CVV. Checkout demo phải nói rõ không xử lý thanh toán thật.
- Ưu tiên khả năng mua hàng: tìm sản phẩm → xem chi tiết → thêm giỏ → checkout → xác nhận/tra cứu đơn.
- Responsive, accessibility, loading/error/empty state và reduced motion là acceptance criteria, không phải phần hoàn thiện sau cùng.
- UI không hard-code domain data hoặc business rule. Component chỉ nhận dữ liệu qua typed props/hooks; product, category, price, inventory, promotion, shipping, order status, ETA và TTL phải đến từ API hoặc shared typed configuration có một owner duy nhất.
- Implementation chỉ thực hiện trong `techx-platform`; mỗi phase phải pass local gate trước khi sang phase tiếp theo.

## 2. Audit hiện trạng

### 2.1 Điểm đang tốt và nên giữ

- Đã có 7 route rõ ràng: home, catalog, product detail, cart, checkout, confirmation và order lookup.
- Cart có state dùng chung, schema/version và lưu `sessionStorage`; lỗi dữ liệu cũ được loại an toàn.
- BFF giữ API key ở server, có timeout/retry/rate limit và error envelope.
- Order API tự lấy giá từ Catalog, hỗ trợ idempotency, giới hạn input và khóa subtotal/shipping/total trong order.
- Có loading, error, empty state cơ bản; focus style và `prefers-reduced-motion` đã được cân nhắc.
- Luồng backend và cart đã có unit/integration test nền tảng.

### 2.2 Vấn đề dữ liệu và độ tin cậy

- Catalog chỉ có 6 sản phẩm và schema quá phẳng: `id`, `name`, `description`, `priceCents`, `image`.
- Category được suy đoán bằng keyword trong tên/mô tả; count category hard-code trong hai component nên dễ sai.
- Hero hiển thị Nova Refractor `$299.00`, trong API là `$129.00`.
- Mọi card/detail đều tự tạo giá gạch ngang `+15%`, nhãn `−13%`, rating `4.5`, `124 reviews`, “Featured” và “In Stock` dù API không có các dữ liệu này.
- Các claim `50K+ Customers`, `2-Year Warranty`, `Expert Support 7 days`, delivery `3–5 days` và “items are on their way” không có dữ liệu hoặc nghiệp vụ hỗ trợ.
- 6 SVG hiện tại rất nhỏ và mang tính placeholder; chưa tạo được cảm giác catalog thật hoặc hierarchy hình ảnh tốt.
- Order không chứa customer, shipping address, fulfillment/status hoặc estimated delivery; trang tracking thực tế chỉ là lookup chi tiết đơn và thời gian hết hạn.

### 2.3 Vấn đề UI/UX và hành vi

- Search bị disabled; rating filter chỉ là text; promo code không hoạt động; newsletter submit không làm gì; wishlist chỉ sống trong state riêng của từng card.
- Checkout prefill thông tin cá nhân và test card, thu cả số thẻ/CVV nhưng request chỉ gửi `items`. Điều này gây hiểu nhầm về thanh toán và là UX/security anti-pattern.
- Confirmation hard-code “Demo User”, không lấy từ order; copy trạng thái giao hàng không phản ánh backend.
- Product card quá nhiều thành phần cạnh tranh (badge, wishlist, rating, sale, quantity, CTA), làm catalog nặng và khó scan.
- Header mobile ẩn navigation nhưng chưa có menu thay thế; người dùng chủ yếu chỉ còn logo/cart.
- Filter state chưa đầy đủ trong URL: category và sort có URL, price thì không; back/forward và share URL không tái tạo đúng kết quả.
- Category/filter/count bị lặp ở nhiều file; inline style nhiều, CSS toàn cục lớn, gây khó giữ consistency.
- Trang chủ tập trung vào mô tả hạ tầng EKS thay vì nhu cầu khách hàng; thông tin kỹ thuật nên chuyển xuống footer/About demo note.
- Automated test chưa bao phủ page flow, filter/search URL, checkout validation, accessibility và responsive visual regression.

## 3. Product direction đã chốt

### 3.1 Định vị storefront

Giữ niche **astronomy & outdoor optics**, dùng brand `TechX Observatory Supply`. Trải nghiệm hướng đến người mới và người chơi bán chuyên, với tone đáng tin cậy, ít phô trương hơn giao diện marketplace.

Navigation chính:

- Shop
- Telescopes
- Binoculars
- Accessories
- Track demo order
- Cart

Copy phải phân biệt rõ:

- Nội dung mua sắm: ưu tiên sản phẩm, use case, giá và fulfillment.
- Nội dung demo: một banner nhỏ “Demo storefront — no real payment or shipment”; chi tiết EKS/GitOps chỉ ở footer.

### 3.2 Information architecture

```text
Home
├── announcement/demo bar
├── value-led hero
├── shop by category
├── featured products
├── beginner buying guide
└── service promises chỉ từ dữ liệu/chính sách đã chốt

Shop
├── search + result count + sort
├── category / price / availability filters
└── product grid

Product detail
├── gallery + product facts
├── price / availability / quantity / add to cart
├── shipping and return policy
└── related products theo category/tag

Cart → Checkout → Confirmation → Order lookup
```

Không thêm auth, account area, wishlist page, review system hoặc payment gateway trong scope này.

## 4. Thiết kế lại dữ liệu

### 4.1 Product contract v2

Thay schema cũ bằng contract có dữ liệu ecommerce rõ nghĩa:

```ts
type ProductCategory = "telescopes" | "binoculars" | "accessories";
type Availability = "in_stock" | "low_stock" | "out_of_stock";

interface Product {
  id: string; // stable slug
  sku: string; // unique, customer-facing
  name: string;
  category: ProductCategory;
  shortDescription: string; // card copy
  description: string; // detail copy
  priceCents: number;
  compareAtPriceCents?: number; // chỉ có khi sale thật trong seed
  currency: "USD";
  availability: Availability;
  inventoryQuantity: number; // 0..99 cho demo
  featured: boolean;
  tags: string[];
  specifications: Array<{ label: string; value: string }>;
  images: Array<{ src: string; alt: string }>;
}
```

Validation khi Catalog khởi động:

- ID/SKU unique; string trim và giới hạn độ dài.
- Giá là integer dương; `compareAtPriceCents` nếu có phải lớn hơn `priceCents`.
- Currency chỉ `USD`; category/availability dùng enum.
- Inventory khớp availability (`0` là out of stock; low stock dùng ngưỡng đã chốt).
- Có ít nhất một ảnh với alt cụ thể và 3 specification hữu ích.
- API trả lỗi fail-fast khi seed invalid thay vì phục vụ dữ liệu nửa đúng.

### 4.2 Catalog seed mới

Thay toàn bộ 6 record cũ bằng 12 sản phẩm có phân bố cân bằng:

| Category    | Số lượng | Price band | Ví dụ nội dung                                                        |
| ----------- | -------: | ---------- | --------------------------------------------------------------------- |
| Telescopes  |        4 | $129–$699  | beginner refractor, tabletop reflector, travel scope, smart telescope |
| Binoculars  |        3 | $79–$249   | compact, stargazing 10x50, weatherproof 8x42                          |
| Accessories |        5 | $18–$149   | lunar filter, eyepiece set, red light, tripod, optics care kit        |

Yêu cầu seed:

- 3–4 featured products, tối đa 3 sản phẩm có compare-at price, ít nhất 1 low-stock và 1 out-of-stock để test UI thật.
- Tên, mô tả, specs, alt text và SKU riêng; không copy lặp.
- Category count được tính từ response, không hard-code.
- Ảnh mới đồng nhất tỉ lệ 4:3 hoặc 1:1, nền và lighting nhất quán. Có thể dùng local WebP/AVIF hoặc SVG được thiết kế lại; không phụ thuộc CDN ngoài.
- Không thêm rating/review nếu chưa có review data thật. Phase này mặc định bỏ hoàn toàn rating và rating filter.

### 4.3 Order contract v2

Checkout gửi dữ liệu cần thiết cho một đơn demo, không gửi payment credential:

```ts
interface CreateOrderInput {
  items: Array<{ productId: string; quantity: number }>;
  customer: { name: string; email: string };
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    region: string;
    postalCode: string;
    countryCode: "US";
  };
  shippingMethod: "standard";
}

interface Order {
  // existing immutable item and total snapshot
  customer: { name: string; emailMasked: string };
  shippingAddress: {
    city: string;
    region: string;
    postalCode: string;
    countryCode: string;
  };
  status: "confirmed";
  shippingMethod: "standard";
  estimatedDelivery: { from: string; to: string };
}
```

Guardrails:

- Backend allowlist/validate toàn bộ field, normalize text, giới hạn body và không log PII.
- Chỉ lưu email dạng masked trong order response/store; không lưu full email hoặc full street address vì order store là demo in-memory.
- Inventory chỉ dùng để chặn out-of-stock và quantity vượt seed; không trừ tồn kho để tránh giả định concurrency/persistence không tồn tại.
- Order status cố định `confirmed`; UI gọi là “Order lookup”, không hứa tracking shipment thời gian thực.
- Shipping rule nằm ở Order API và được expose dưới dạng quote/config hoặc shared contract để cart preview không drift.

### 4.4 Quy tắc “không hard-code UI”

Không hard-code không có nghĩa mọi chữ đều phải đưa vào database hoặc CMS. Phân quyền dữ liệu như sau:

| Loại dữ liệu                                                                  | Source of truth                            | UI được phép làm gì                                                                |
| ----------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------- |
| Product, category, SKU, ảnh, alt, giá, sale, inventory, featured, specs, tags | Catalog API                                | Render từ response; không khai báo lại trong page/component                        |
| Category/facet count và filter option                                         | Catalog response/facet selector dùng chung | Tính từ data hoặc dùng metadata API; không giữ mảng/count riêng trong Home/Sidebar |
| Shipping threshold, fee, method, order total, status, ETA và TTL              | Order API/config endpoint                  | Preview từ contract dùng chung; confirmation dùng server response                  |
| Route và navigation item                                                      | Một typed site-config module               | Component map config; không lặp route/label ở Header/Footer/mobile menu            |
| UI copy, error message mapping và demo disclaimer                             | Một typed content module theo locale       | Component tham chiếu key; không rải literal khác nhau giữa các trang               |
| Color, spacing, typography, radius, breakpoint, z-index                       | Design token/CSS custom properties         | Không dùng magic color/spacing/inline style trong component                        |
| Giới hạn form/cart dùng chung                                                 | Shared schema/contract                     | Không lặp `99`, format, enum hoặc validation rule ở nhiều layer                    |
| Test data                                                                     | Fixture/factory riêng                      | Không import fixture vào production bundle                                         |

Guardrails khi implement:

- Không xuất hiện product ID/name/price/image path cụ thể trong JSX/TSX, kể cả hero và related product.
- Không suy đoán category, sale, availability hoặc badge từ chuỗi tên/mô tả.
- Không tính lại business rule trong component. Backend trả total chính thức; shared selector chỉ phục vụ preview được test parity.
- Không fetch trực tiếp rải rác trong page. Dùng typed API client/query hook duy nhất để normalize loading/error/data.
- Không lặp enum/label mapping giữa Catalog, Cart, Checkout và Order; dùng contract hoặc presentation adapter tập trung.
- Text thực sự cố định như label nút, heading và accessibility instruction được phép tồn tại trong typed content module; không yêu cầu CMS cho thin slice.
- ESLint/review gate cấm inline style mới và magic domain value trong component; ngoại lệ phải có comment giải thích và test.

## 5. Kế hoạch UI/UX theo màn hình

### 5.1 Global shell và design system

- Chuẩn hóa token: color, type scale, spacing, radius, elevation, container width và z-index; giảm inline style và chia CSS theo component/section hợp lý.
- Giảm palette navy/gold đậm đặc; dùng nền trung tính sáng cho catalog, navy làm brand anchor và gold chỉ cho primary action/promotion thật.
- Header desktop có search thật, category nav, order lookup và cart; mobile có menu button/drawer với focus trap, Escape và scroll lock.
- Demo banner nhỏ, dismissible theo session, nói rõ không charge card/ship goods.
- Footer bỏ form newsletter và social link chung chung; thay bằng Shop, Help, Demo information và trạng thái “orders expire after 1 hour”.
- Tất cả icon có cùng hệ vector; bỏ emoji khỏi primary controls để giao diện đồng nhất.
- Chuẩn hóa `Button`, `Input`, `Select`, `Badge`, `Alert`, `Skeleton`, `Dialog/Drawer`, `Toast` với trạng thái hover/focus/disabled/loading.

### 5.2 Home

- Hero lấy featured product từ API hoặc dùng copy category-level; không hard-code tên/giá riêng.
- Copy tập trung vào lựa chọn thiết bị quan sát phù hợp; chuyển EKS/GitOps xuống footer.
- Category cards tính count từ catalog và link bằng query canonical.
- Featured section chỉ dùng `featured=true`, tối đa 4 card; thêm “New to astronomy?” buying-guide block giúp người dùng chọn telescope/binocular/accessory.
- Chỉ giữ service promise đã chốt: demo shipping price/rule và order TTL; không dùng customer/review/warranty claim không được hỗ trợ.

### 5.3 Shop/catalog

- Search theo name, SKU, short description và tags; debounce nhẹ, clear button, count và empty state có ngữ cảnh.
- Category, price và availability filter đều lấy từ data; mọi state được serialize vào URL (`q`, `category`, `price`, `availability`, `sort`).
- Category count và facet count tính động; bỏ rating filter.
- Sort: Featured, Price low/high, Name A–Z. Featured sort dựa trên field thật.
- Desktop sidebar gọn; mobile filter drawer có số filter đang active và nút Apply/Clear.
- Product card ưu tiên ảnh, category, name, price, availability và CTA. Quantity chỉ chọn ở detail/cart; card dùng một nút Add hoặc View product.
- Out-of-stock disable Add và gợi ý related item; low-stock chỉ hiện khi có inventory data tương ứng.

### 5.4 Product detail

- Gallery từ `images[]`, thumbnail có selected state và alt đúng.
- Hiển thị breadcrumb category, SKU, description, specifications và tags hữu ích.
- Chỉ render compare-at/discount khi field tồn tại; tính phần trăm từ hai giá thật.
- Availability và max quantity lấy từ inventory; thông báo add-to-cart qua live region.
- Related products cùng category/tags, loại current product, không lấy 3 record đầu tùy ý.
- Không hiển thị rating/review giả.

### 5.5 Cart

- Row gọn hơn, ảnh/link sản phẩm, availability snapshot warning, quantity và remove có confirm/undo toast phù hợp.
- Summary lấy shipping preview từ rule dùng chung; giải thích threshold và phí rõ ràng.
- Bỏ promo input và payment logos khi không có backend tương ứng.
- CTA checkout bị disable khi cart có out-of-stock hoặc quantity không hợp lệ; có inline resolution.
- Mobile có summary sau item list và sticky checkout bar vừa phải, không che nội dung.

### 5.6 Checkout

- Bỏ hoàn toàn card number, expiry và CVV.
- Form rỗng mặc định; có Contact, Shipping address và một payment panel read-only: “Demo checkout — no payment will be collected”.
- Dùng native autocomplete/inputMode phù hợp và validation theo field; error gắn bằng `aria-describedby`, focus field lỗi đầu tiên.
- Order submit giữ một idempotency key ổn định cho cùng một attempt; retry network không tạo key mới cho đến khi payload đổi hoặc order thành công.
- Review summary hiển thị items, subtotal, shipping và total; server response là source of truth sau submit.
- Không clear cart trước khi confirmation đã lưu/route thành công; failure giữ form và cart.

### 5.7 Confirmation và order lookup

- Confirmation dùng customer name/status/ETA từ order response, không hard-code.
- Nói rõ đơn là demo, thời điểm hết hạn và không có shipment thật.
- Hiển thị timeline duy nhất `Confirmed`; không tạo các bước packed/shipped/delivered giả.
- Order lookup validate format trước request, có paste/copy feedback và render đầy đủ item snapshot/totals/status/ETA.
- Phân biệt rõ `not found`, `expired`, `service unavailable` và invalid ID; không gom mọi lỗi thành “Not found”.
- Format date ổn định, tránh hydration/locale mismatch; hiển thị timezone rõ ràng nếu cần.

### 5.8 Low-fidelity wireframes đã chốt

Các wireframe dưới đây xác định hierarchy và responsive stacking; component không sở hữu product/business data.

```text
GLOBAL
┌──────────────── demo notice ────────────────┐
│ logo | primary nav | search | order | cart │  desktop
│ menu | logo                    | cart       │  mobile
├──────────────── main content ───────────────┤
└──────────── shop/help/demo footer ──────────┘

HOME
┌──────── value-led hero ───────┬─ featured product from API ─┐
├──────── category cards with API facet counts ────────────────┤
├──────── featured product grid from featured=true ────────────┤
├──────── beginner buying guide ────────────────────────────────┤
└──────── verified demo/service principles ────────────────────┘

SHOP
┌──────────────── search + result count + sort ────────────────┐
├─ filters/facets ─┬──────────── product grid ─────────────────┤
│ desktop sidebar  │ image / category / price / stock / CTA   │
│ mobile drawer    │ loading / error / empty / results         │
└──────────────────┴───────────────────────────────────────────┘

PRODUCT
breadcrumb
┌──────── image gallery ────────┬─ facts / price / inventory ──┐
│ API images + selected state   │ quantity / add / demo notice │
├───────────────────────────────┴───────────────────────────────┤
│ specifications                         related API products   │
└───────────────────────────────────────────────────────────────┘

CART                         CHECKOUT
┌──────── items ──────┐      ┌──── contact/address form ────┐
│ image/facts/qty/rm  │      │ no-payment demo panel        │
├──────── summary ────┤      ├──── server-config summary ───┤
│ subtotal/ship/total │      │ validation + stable retry    │
└─────────────────────┘      └───────────────────────────────┘

CONFIRMATION                  ORDER LOOKUP
┌─ confirmed/status/ETA ─┐    ┌─ validated order ID form ───┐
│ item snapshot + totals │    │ typed error / result detail │
│ masked/coarse customer │    │ copy feedback + TTL notice  │
└────────────────────────┘    └──────────────────────────────┘
```

Ở breakpoint mobile, mọi layout hai cột stack theo thứ tự nội dung → action/summary; filter và navigation chuyển thành drawer có focus trap.

### 5.9 Accessibility baseline đã chốt

| Area                | Keyboard/focus requirement                                       | Semantic/feedback requirement                                  | Evidence owner                        |
| ------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------- |
| Global shell        | Skip link, visible focus, ≥44 px target                          | Header/nav/main/footer landmark                                | CSS + `Header`/`Footer`               |
| Mobile nav/filter   | Focus first control, trap Tab/Shift+Tab, Escape, restore trigger | Dialog/drawer name, modal state, scroll lock                   | `useFocusTrap` + focus test           |
| Search/filter/sort  | Labelled controls; Apply/Clear reachable                         | URL state, result count live update, contextual empty/error    | Shop page + selector tests            |
| Product/cart        | Quantity controls and CTA keyboard-operable                      | Image alt, availability badge, add/reconcile live status       | PDP/cart components + cart tests      |
| Checkout            | Focus first invalid field; submit state retained on failure      | Labels, autocomplete, `aria-invalid`/`aria-describedby`, alert | Checkout page + validation tests      |
| Confirmation/lookup | Copy/lookup actions keyboard-operable                            | Typed errors, stable date format, masked PII                   | Order pages + cache/error tests       |
| Motion/contrast     | Reduced-motion override; no interaction depends on animation     | Token-based foreground/background pairs                        | CSS tokens + axe representative tests |

Automated baseline: axe không có critical/serious violation trên component đại diện; focus trap/Escape/focus restore có test riêng. Full-page contrast, overflow và zoom không có browser evidence; owner đã chấp thuận waive gate này trước khi push.

## 6. Phase triển khai end-to-end

### Phase U0 — Baseline và contract freeze

- [x] WAIVED BY OWNER: không yêu cầu screenshot baseline 360×800, 768×1024 và 1440×900 trước khi push.
- [x] Ghi accessibility baseline: keyboard flow, focus order, landmark/heading, label, contrast và reduced motion.
- [x] Chốt Product v2, CreateOrder v2, Order v2, shipping rule và error mapping trước khi sửa component.
- [x] Lập data-ownership matrix theo mục 4.4; chốt typed `site-config`, `content`, API client và shared schema để component không tự giữ domain constant.
- [x] Chốt wireframe low-fidelity cho home, catalog, PDP, cart, checkout, confirmation và lookup.
- [x] Gate: contract/wireframe được review với data-ownership matrix; không còn quyết định data lớn để dồn sang lúc code.

> Baseline trước thay đổi không thể tái tạo sau implementation. Owner chấp thuận waive screenshot/browser gates ngày 2026-08-09; waiver không được diễn giải thành bằng chứng visual đã pass.

### Phase U1 — Catalog data foundation

- [x] Tạo 12 seed records mới và asset manifest; xóa 6 records/asset cũ khi replacement đã đủ.
- [x] Thêm runtime validation và test invalid/duplicate seed.
- [x] Cập nhật Catalog API/types/test cho Product v2.
- [x] API hoặc selector tập trung cung cấp category metadata/facet count; không để Home và Sidebar tự khai báo category riêng.
- [x] Gate: Catalog check/test pass; mọi price/category/availability/spec/image hợp lệ và không có product/category domain data hard-code ở frontend.

### Phase U2 — Design system và responsive shell

- [x] Refactor token/component primitives; loại inline style trọng yếu và emoji trong controls.
- [x] Tạo typed site/content config dùng chung cho Header, mobile navigation, Footer, demo banner, label và error presentation.
- [x] Implement header desktop/mobile, demo banner và footer trung thực.
- [x] Thêm focus management cho drawer/dropdown và viewport rules.
- [x] WAIVED BY OWNER: không yêu cầu browser overflow/keyboard check ở 360/768/1440; axe/component focus tests đã pass.

### Phase U3 — Discovery flow: Home, Shop, Product detail

- [x] Home dùng dữ liệu API cho featured/category counts.
- [x] Gom fetch/normalize/error mapping vào typed API client/query hooks; page/component không tự lặp fetch contract.
- [x] Implement search, filter, sort và canonical URL state.
- [x] Simplify product card và implement PDP gallery/specs/availability/related logic.
- [x] Hoàn chỉnh loading/error/empty/no-result/out-of-stock states.
- [x] Gate data/behavior: không còn fake rating/sale/stock/claim; add-to-cart chạy đúng max inventory.
- [x] WAIVED BY OWNER: không yêu cầu URL share/back/forward verification trong browser thật trước khi push.

### Phase U4 — Cart và pricing consistency

- [x] Reconcile cart snapshot với catalog mới khi session reload; xử lý product removed/price/availability changed.
- [x] Dùng cùng shipping rule với backend hoặc endpoint quote rõ ràng.
- [x] Loại magic quantity/fee/threshold khỏi component; dùng shared schema/config với parity test backend–frontend.
- [x] Bỏ promo/payment affordance không hoạt động; hoàn thiện reconciliation/error behavior.
- [x] Gate: cart subtotal/shipping/total preview khớp Order API cho tất cả boundary `$49.99`, `$50.00`, multi-item và quantity max.

### Phase U5 — Checkout và Order v2

- [x] Mở rộng Order API contract/store/test với customer masked data, coarse address, status và ETA.
- [x] Thay payment form bằng demo notice; implement validation, autocomplete và stable idempotency attempt.
- [x] Confirmation và lookup render hoàn toàn từ Order v2; sửa error taxonomy.
- [x] Mọi status label, ETA, TTL và shipping method được map tập trung từ contract; không có copy nghiệp vụ hard-code trong page.
- [x] Gate: happy path, retry/idempotency, invalid form, expired order, dependency unavailable và empty-cart direct navigation đều pass.

### Phase U6 — Quality hardening và local acceptance

- [x] Unit test data validation, facets/search/sort, pricing and form validation.
- [x] Thêm static review/test kiểm tra component không chứa product fixture, ID, price, image path, category count, shipping threshold/fee, raw JSX copy hoặc duplicated domain enum.
- [x] Component/integration test cart reconciliation, checkout submit, confirmation cache fallback và lookup errors.
- [x] WAIVED BY OWNER: không yêu cầu Browser E2E trước khi push; BFF/runtime/container E2E đã pass.
- [x] WAIVED BY OWNER: không yêu cầu visual regression 360/768/1440 hoặc 200% zoom trước khi push.
- [x] Accessibility automated gate: axe không có critical/serious issue trên các component đại diện; focus trap, Escape và focus restore có test; semantics/labels/live regions/touch target đã được implement.
- [x] Performance static gate: ảnh có kích thước khai báo, data fetch tập trung, asset local và không phụ thuộc image CDN.
- [x] Chạy `npm run check`, `npm run lint`, `npm test`, `npm run build`, local service E2E và container smoke/recovery/soak.
- [x] Gate theo scope được owner phê duyệt: automated/code/runtime/container acceptance pass; browser/visual acceptance được waive rõ ràng.

### Phase U7 — Handoff (chỉ khi có yêu cầu triển khai riêng)

- [x] Review diff để xác nhận chỉ `techx-platform`; cập nhật README/API docs/evidence.
- [x] Chốt breaking change của seed/session cart; bump cart schema để data cũ tự bị bỏ an toàn.
- [x] Không commit/push/deploy khi chưa có xác nhận riêng; kế hoạch này không cấp quyền apply AWS.

## 7. Acceptance criteria

### Data integrity

- 12 sản phẩm hợp lệ; không ID/SKU trùng, broken image, category suy đoán hoặc count hard-code.
- Mọi giá/sale/availability/spec/featured state hiển thị đều xuất phát từ API.
- Không còn `4.5`, `124 reviews`, `50K+`, fake warranty/support, fake shipment hoặc giá hero lệch catalog.
- Product ngoài stock không thể order; server vẫn là authority về product và price.

### Ecommerce behavior

- Search/filter/sort kết hợp được, URL tái tạo state và back/forward đúng.
- Cart persist trong session, reconcile được catalog thay đổi và không vượt inventory.
- Checkout không thu payment credential, validate rõ ràng và chống double-submit bằng idempotency ổn định.
- Confirmation/lookup có dữ liệu nhất quán với order server và nói rõ TTL/demo semantics.
- Không có dead control hoặc control “coming soon” trông như đang hoạt động.

### UI/UX và accessibility

- 7 route và state chính không overflow ở 360, 768, 1440 px; 200% zoom vẫn dùng được.
- Keyboard flow đầy đủ; focus visible, drawer/dropdown giữ và trả focus đúng; Escape đóng overlay.
- Heading/landmark/label/error/live-region đúng; ảnh có alt; target tương tác tối thiểu 44×44 px.
- Không layout shift lớn khi load ảnh/data; loading/error/empty state giữ hierarchy ổn định.
- Nội dung mua sắm dùng language/tone nhất quán; chi tiết DevOps không lấn át storefront.

### Engineering gates

- Type-check, lint, unit/integration, build và local E2E đều xanh.
- JSX/TSX không chứa domain data hoặc business-rule magic value; UI render từ typed API/config/content source theo data-ownership matrix.
- Không có product/category/navigation/label mapping bị khai báo lặp giữa các page/component; test fixture tách khỏi production code.
- Không log API key, full email, street address hoặc dữ liệu form nhạy cảm.
- Không thay chart/infra, không gọi AWS và không phát sinh cloud cost trong toàn bộ Phase U0–U6.

## 8. Thứ tự ưu tiên nếu cần cắt scope

P0 bắt buộc:

- Product v2 + seed mới + validation.
- Xóa dữ liệu/claim/function giả.
- Catalog discovery, PDP, cart/pricing consistency.
- Checkout không thu card + Order v2 tối thiểu.
- Responsive/accessibility/test local.

P1 nên có:

- Multi-image gallery, buying guide, inventory reconciliation UX và visual regression automation.

P2 có thể hoãn:

- Wishlist thật, reviews/ratings, promo engine, newsletter, nhiều shipping methods, account/auth và payment gateway.

P2 chỉ được thêm khi có backend/data/lifecycle tương ứng; không dựng UI giả trước.

## 9. Implementation evidence — 2026-08-09

### 9.1 Không hard-code UI

- Catalog, category/facet count, SKU, ảnh, giá, sale, inventory, featured, specs và tags đều render từ Catalog API.
- Shipping threshold/fee, max quantity, method, TTL và order totals đến từ Order API qua `GET /api/store-config`; frontend không giữ bản sao business value.
- Route/navigation, availability/filter/sort presentation, UI limit/timing và toàn bộ visible copy/ARIA/placeholder nằm trong typed `site-config`/`CONTENT`.
- `scripts/ui-hardcode-audit.ps1` được gọi bởi `scripts/verify.ps1` và fail khi TSX chứa catalog ID/SKU/name/image, route trực tiếp, inline style, unsupported claim/control, raw JSX copy hoặc accessibility/input copy trực tiếp.
- Test fixture nằm riêng trong `src/frontend/test`; production code không import fixture.

### 9.2 Automated verification

Các lệnh sau đã pass trên local:

```text
scripts/ui-hardcode-audit.ps1  -> passed
npm run check                 -> passed (3 workspaces)
npm run lint                  -> passed
npm test                      -> 38 passed
  Catalog API                 -> 6
  Order API                   -> 12
  Frontend                    -> 20 across 9 files
npm run build                 -> passed; 12 Next.js pages generated
git diff --check              -> passed
asset validation              -> 12 products / 12 parseable SVG / 0 missing path
```

Frontend tests gồm catalog selector, cart v2/reconciliation và shipping boundary, checkout validation, BFF order flow/idempotency, accessibility axe, focus trap/Escape/focus restore, confirmation cache fallback và lookup error taxonomy.

### 9.3 Runtime và container stability

- Production-mode local services trả `200` cho health/readiness, catalog, store-config và cả 7 storefront route.
- BFF E2E đã tạo/replay/lookup Order v2, xác nhận locked totals, masked email và coarse address.
- `docker compose up --build -d` pass; dependency install báo `0 vulnerabilities`; cả 3 service đạt `healthy`.
- Container smoke pass cho cả free-shipping và paid-shipping order, rồi lookup đúng locked totals.
- Sequential recovery pass cho `catalog-api`, `order-api`, `frontend`; không có restart cascade.
- Soak pass: 60 giây steady traffic và controlled burst 30 request; chỉ chấp nhận `201/429`, restart count không đổi. Memory đầu/cuối: Catalog `17.49 → 17.65 MiB`, Order `18.90 → 18.96 MiB`, Frontend `41.83 → 43.02 MiB`.
- Đã chạy `docker compose down --volumes --remove-orphans`; `docker compose ps` trống.

### 9.4 Scope và phần còn mở

- `techx-chart` và `techx-infra` sạch; không sửa chart/infra, không gọi AWS, không build/push cloud image và không phát sinh cloud resource/cost.
- In-app Browser không cung cấp browser session trong môi trường hiện tại, nên không có bằng chứng screenshot/interaction ở 360×800, 768×1024, 1440×900 và 200% zoom. Owner đã xác nhận không cần browser verification trước khi push ngày 2026-08-09; các mục tương ứng được đóng bằng waiver, không phải bằng visual-pass claim.
- Chưa commit, push hoặc deploy. Phase U7 vẫn cần xác nhận riêng của người dùng.
