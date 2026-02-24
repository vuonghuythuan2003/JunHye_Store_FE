<script setup>
import { onMounted, ref } from 'vue'
import { useAuth } from '../auth/useAuth'
import { storefrontService } from './storefront.service'

const categories = [
  { name: 'Áo khoác', desc: 'Phong cách tối giản, dễ phối đồ', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80' },
  { name: 'Giày thể thao', desc: 'Êm chân, năng động cả ngày dài', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
  { name: 'Bộ sưu tập mùa mới', desc: 'Màu sắc nổi bật, chuẩn xu hướng', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80' },
]

const fallbackProducts = [
  { title: 'Blazer Urban Fit', price: '899.000đ', tag: 'Best Seller', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=80' },
  { title: 'Sneaker White Flow', price: '1.290.000đ', tag: 'New', image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1000&q=80' },
  { title: 'Denim Relaxed', price: '690.000đ', tag: 'Hot', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80' },
  { title: 'Leather Boots Edge', price: '1.590.000đ', tag: 'Limited', image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=1000&q=80' },
]

const products = ref([...fallbackProducts])
const actionMessage = ref('')
const actionError = ref('')
const loadingProducts = ref(false)
const selectedDetail = ref(null)

const reviews = [
  { name: 'Khánh Linh', comment: 'Form áo rất đẹp, giao nhanh và đóng gói chỉn chu.' },
  { name: 'Trọng Nhân', comment: 'Giày mang êm, đi làm hay đi chơi đều hợp.' },
  { name: 'Minh Châu', comment: 'Giao diện web dễ xem sản phẩm, đặt hàng tiện.' },
]

const trustSignals = [
  { title: '4.9/5 đánh giá', desc: 'Từ hơn 12.800 phản hồi khách hàng xác thực.' },
  { title: '58.000+ khách đã mua', desc: 'Nhiều người dùng quay lại nhờ chất lượng ổn định.' },
  { title: 'Bảo mật dữ liệu', desc: 'Thanh toán và thông tin cá nhân được bảo vệ an toàn.' },
  { title: 'Đổi trả 7 ngày', desc: 'Hỗ trợ đổi size hoặc hoàn trả nhanh gọn.' },
]

const { isAuthenticated } = useAuth()
const showLoginPrompt = ref(false)
const blockedAction = ref('')

const loginRequiredActions = {
  addToCart: 'thêm sản phẩm vào giỏ',
  saveItem: 'lưu sản phẩm yêu thích',
  checkout: 'thanh toán đơn hàng',
  advancedDetail: 'xem chi tiết nâng cao',
}

const setActionFeedback = (message = '', error = '') => {
  actionMessage.value = message
  actionError.value = error
}

const runAction = async (actionKey, item = null) => {
  setActionFeedback('', '')

  if (isAuthenticated()) {
    try {
      if (actionKey === 'addToCart') {
        if (!item?.productId) {
          throw new Error('Sản phẩm chưa có mã từ hệ thống BE')
        }

        const result = await storefrontService.addToCart(item.productId, 1)
        setActionFeedback(result.message || 'Đã thêm vào giỏ hàng')
        return
      }

      if (actionKey === 'checkout') {
        const summary = await storefrontService.getCartSummary()
        setActionFeedback(`Giỏ hiện có ${summary.totalQuantity} sản phẩm. Bạn có thể tiếp tục quy trình thanh toán.`)
        return
      }

      if (actionKey === 'advancedDetail') {
        if (!item?.productId) {
          throw new Error('Sản phẩm chưa có mã từ hệ thống BE')
        }

        selectedDetail.value = await storefrontService.getAdvancedDetail(item.productId)
        setActionFeedback('Đã tải chi tiết nâng cao từ backend')
        return
      }

      if (actionKey === 'saveItem') {
        const key = 'junhye.saved.products'
        const savedRaw = localStorage.getItem(key)
        const savedItems = savedRaw ? JSON.parse(savedRaw) : []
        const exists = savedItems.some((saved) => saved.productId === item?.productId)

        if (!exists && item?.productId) {
          savedItems.push({ productId: item.productId, title: item.title })
          localStorage.setItem(key, JSON.stringify(savedItems))
        }

        setActionFeedback('Đã lưu sản phẩm yêu thích')
        return
      }

      return
    } catch (error) {
      setActionFeedback('', error.message || 'Không thể xử lý thao tác với backend')
      return
    }
  }

  blockedAction.value = loginRequiredActions[actionKey] || 'thực hiện thao tác này'
  showLoginPrompt.value = true
}

const closeLoginPrompt = () => {
  showLoginPrompt.value = false
}

const closeAdvancedDetail = () => {
  selectedDetail.value = null
}

const loadProducts = async () => {
  loadingProducts.value = true

  try {
    const backendProducts = await storefrontService.loadProducts()
    if (backendProducts.length > 0) {
      products.value = backendProducts
      setActionFeedback('Đã đồng bộ sản phẩm từ backend')
    } else {
      setActionFeedback('Backend chưa có dữ liệu sản phẩm, đang hiển thị mẫu mặc định')
    }
  } catch (error) {
    products.value = [...fallbackProducts]
    setActionFeedback('', error.message || 'Không thể tải sản phẩm từ backend')
  } finally {
    loadingProducts.value = false
  }
}

onMounted(() => {
  loadProducts()

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show')
        }
      })
    },
    { threshold: 0.15 },
  )

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
})
</script>

<template>
  <div class="storefront">
    <header class="topbar reveal">
      <div class="brand">JunHye Fashion</div>
      <nav>
        <a href="#collections">Bộ sưu tập</a>
        <a href="#products">Sản phẩm</a>
        <a href="#reviews">Đánh giá</a>
      </nav>
      <RouterLink to="/auth" class="btn btn-outline">Đăng nhập</RouterLink>
    </header>

    <section class="hero reveal">
      <div class="hero-content">
        <p class="eyebrow">NEW ARRIVAL 2026</p>
        <h1>Thời trang hiện đại cho mọi chuyển động</h1>
        <p class="subtitle">Khám phá bộ sưu tập quần áo và giày dép cao cấp, thiết kế trẻ trung, dễ phối và luôn bắt trend.</p>
        <div class="hero-actions">
          <button class="btn btn-primary" @click="runAction('checkout')">Mua ngay</button>
          <button class="btn btn-ghost">Xem lookbook</button>
        </div>
      </div>
      <div class="hero-card floating">
        <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80" alt="Fashion collection" />
      </div>
    </section>

    <section id="collections" class="categories reveal">
      <article v-for="item in categories" :key="item.name" class="category-card">
        <img :src="item.image" :alt="item.name" />
        <div class="overlay">
          <h3>{{ item.name }}</h3>
          <p>{{ item.desc }}</p>
        </div>
      </article>
    </section>

    <section id="products" class="products reveal">
      <div class="section-title">
        <h2>Sản phẩm nổi bật</h2>
        <p>Thiết kế tối giản, chất liệu cao cấp, dễ mặc mỗi ngày.</p>
      </div>
      <p v-if="loadingProducts" class="helper">Đang tải sản phẩm từ backend...</p>
      <p v-if="actionMessage" class="helper success">{{ actionMessage }}</p>
      <p v-if="actionError" class="helper error">{{ actionError }}</p>
      <div class="product-grid">
        <article v-for="item in products" :key="item.productId || item.title" class="product-card">
          <div class="thumb-wrap">
            <img :src="item.image" :alt="item.title" class="thumb" />
            <span class="badge">{{ item.tag }}</span>
          </div>
          <div class="product-content">
            <h3>{{ item.title }}</h3>
            <p>{{ item.price }}</p>
            <div class="product-actions">
              <button class="btn btn-outline small" @click="runAction('addToCart', item)">Thêm vào giỏ</button>
              <button class="btn btn-ghost small" @click="runAction('saveItem', item)">Lưu</button>
              <button class="btn btn-ghost small" @click="runAction('advancedDetail', item)">Chi tiết nâng cao</button>
            </div>
          </div>
        </article>
      </div>

      <article v-if="selectedDetail" class="advanced-panel">
        <div>
          <h3>{{ selectedDetail.title }}</h3>
          <p>{{ selectedDetail.description || 'Không có mô tả chi tiết.' }}</p>
          <span>Danh mục: {{ selectedDetail.categoryName || 'Đang cập nhật' }}</span>
          <span>Tồn kho: {{ selectedDetail.stockQuantity ?? 0 }}</span>
          <strong>{{ selectedDetail.price }}</strong>
        </div>
        <button class="btn btn-outline small" @click="closeAdvancedDetail">Đóng</button>
      </article>
    </section>

    <section class="promo reveal">
      <h2>Sale Weekend -30%</h2>
      <p>Áp dụng cho toàn bộ danh mục giày dép. Miễn phí vận chuyển cho đơn từ 699.000đ.</p>
      <button class="btn btn-primary" @click="runAction('checkout')">Thanh toán ngay</button>
    </section>

    <section class="trust reveal">
      <div class="section-title">
        <h2>Vì sao khách hàng tin chọn JunHye</h2>
        <p>Trải nghiệm mua sắm minh bạch, giữ nguyên giá hiển thị và tối ưu chuyển đổi.</p>
      </div>
      <div class="trust-grid">
        <article v-for="item in trustSignals" :key="item.title" class="trust-card">
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </article>
      </div>
    </section>

    <section id="reviews" class="reviews reveal">
      <h2>Khách hàng nói gì</h2>
      <div class="review-grid">
        <article v-for="item in reviews" :key="item.name" class="review-card">
          <p>“{{ item.comment }}”</p>
          <strong>{{ item.name }}</strong>
        </article>
      </div>
    </section>

    <footer class="footer reveal">
      <p>© 2026 JunHye Fashion. Nâng tầm phong cách mỗi ngày.</p>
    </footer>

    <div v-if="showLoginPrompt" class="modal-backdrop" @click.self="closeLoginPrompt">
      <section class="login-modal">
        <h3>Vui lòng đăng nhập</h3>
        <p>Bạn cần đăng nhập để {{ blockedAction }}.</p>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="closeLoginPrompt">Để sau</button>
          <RouterLink to="/auth" class="btn btn-primary" @click="closeLoginPrompt">Đăng nhập ngay</RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.storefront {
  width: min(1200px, 92vw);
  margin: 28px auto 40px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--card-bg);
  backdrop-filter: blur(6px);
  position: sticky;
  top: 12px;
  z-index: 9;
}

.brand {
  font-size: 1.25rem;
  font-weight: 700;
}

nav {
  display: flex;
  gap: 18px;
}

nav a {
  color: var(--text-main);
  text-decoration: none;
  font-weight: 500;
}

.hero {
  margin-top: 28px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: center;
}

.eyebrow {
  letter-spacing: 0.2em;
  font-size: 0.8rem;
  color: var(--text-muted);
}

h1 {
  margin: 10px 0 12px;
  font-size: clamp(2rem, 4vw, 3.6rem);
  line-height: 1.1;
}

.subtitle {
  color: var(--text-muted);
  max-width: 56ch;
}

.hero-actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}

.hero-card {
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: 0 25px 60px rgba(20, 20, 43, 0.15);
}

.hero-card img {
  width: 100%;
  height: 100%;
  min-height: 430px;
  object-fit: cover;
}

.categories {
  margin-top: 38px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.category-card {
  border-radius: 18px;
  overflow: hidden;
  position: relative;
  min-height: 260px;
  cursor: pointer;
  transform: translateZ(0);
}

.category-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.category-card:hover img {
  transform: scale(1.08);
}

.overlay {
  position: absolute;
  inset: auto 0 0;
  padding: 16px;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.68));
  color: #fff;
}

.products {
  margin-top: 46px;
}

.section-title p {
  color: var(--text-muted);
}

.helper {
  margin: 10px 0 0;
  color: var(--text-muted);
}

.helper.success {
  color: #166534;
}

.helper.error {
  color: #b91c1c;
}

.product-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.product-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.16);
}

.thumb-wrap {
  position: relative;
}

.thumb {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(10, 10, 20, 0.8);
  color: #fff;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 0.72rem;
}

.product-content {
  padding: 14px;
}

.product-actions {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.advanced-panel {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card-bg);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.advanced-panel h3 {
  margin: 0 0 8px;
}

.advanced-panel p {
  margin: 0 0 8px;
  color: var(--text-muted);
}

.advanced-panel span,
.advanced-panel strong {
  display: block;
}

.promo {
  margin-top: 46px;
  padding: 32px;
  border-radius: 20px;
  color: white;
  background: radial-gradient(circle at 10% 20%, #8f5aff 0%, #4f46e5 45%, #0f172a 100%);
}

.reviews {
  margin-top: 46px;
}

.review-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.trust {
  margin-top: 46px;
}

.trust-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.trust-card {
  padding: 18px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--card-bg);
}

.trust-card h3 {
  margin: 0 0 8px;
}

.trust-card p {
  margin: 0;
  color: var(--text-muted);
}

.review-card {
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card-bg);
}

.footer {
  margin: 44px 0 12px;
  text-align: center;
  color: var(--text-muted);
}

.btn {
  border: none;
  border-radius: 999px;
  padding: 10px 18px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.25s ease, background 0.25s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-primary {
  color: #fff;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
}

.btn-outline {
  border: 1px solid var(--border-strong);
  background: transparent;
  color: var(--text-main);
}

.btn-ghost {
  background: rgba(99, 102, 241, 0.1);
  color: var(--text-main);
}

.btn.small {
  padding: 8px 12px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 20, 0.45);
  backdrop-filter: blur(2px);
  display: grid;
  place-items: center;
  padding: 16px;
  z-index: 60;
}

.login-modal {
  width: min(460px, 100%);
  border-radius: 18px;
  border: 1px solid var(--border);
  background: #fff;
  padding: 22px;
}

.login-modal h3 {
  margin: 0 0 8px;
}

.login-modal p {
  margin: 0;
  color: var(--text-muted);
}

.modal-actions {
  margin-top: 16px;
  display: flex;
  gap: 10px;
}

.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}

.reveal.show {
  opacity: 1;
  transform: translateY(0);
}

.floating {
  animation: floaty 6s ease-in-out infinite;
}

@keyframes floaty {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@media (min-width: 680px) {
  .categories,
  .review-grid,
  .trust-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 980px) {
  .hero {
    grid-template-columns: 1.1fr 1fr;
  }

  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .categories,
  .review-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .hero-card {
    grid-column: 1 / -1;
  }
}

@media (min-width: 980px) {
  .hero-card {
    grid-column: auto;
  }
}

@media (max-width: 680px) {
  nav {
    display: none;
  }

  .promo {
    padding: 22px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions .btn {
    width: 100%;
    text-align: center;
  }
}
</style>
