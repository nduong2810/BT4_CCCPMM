import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../../lib/apiClient';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

// Import Redux hooks và action
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { getProductImageUrl, PLACEHOLDER_IMAGE } from '../../utils/imageUrl';

const VIEW_TRACK_TTL = 3000;

const ProductDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [lastUpdated, setLastUpdated] = useState(null);

    // 1. Khai báo dispatch
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.login);

    const stock = useMemo(() => Number(product?.stock ?? product?.countInStock ?? 0), [product]);

    const shouldTrackView = useCallback(() => {
        const key = `product-view-tracked-${id}`;
        const now = Date.now();
        const lastTrackedAt = Number(sessionStorage.getItem(key) || 0);

        if (now - lastTrackedAt < VIEW_TRACK_TTL) {
            return false;
        }

        sessionStorage.setItem(key, String(now));
        return true;
    }, [id]);

    const loadProduct = useCallback(async ({ trackView = false } = {}) => {
        try {
            const increaseView = trackView && shouldTrackView();
            const params = new URLSearchParams({
                t: String(Date.now()),
                skipView: increaseView ? 'false' : 'true'
            });

            const res = await apiClient.get(`/products/${id}?${params.toString()}`);
            setProduct(res.data);
            setLastUpdated(new Date());
            setQuantity(q => Math.min(Math.max(q, 1), Number(res.data?.stock ?? res.data?.countInStock ?? 0) || 1));

            const rel = await apiClient.get(`/products?category=${res.data.category}&exclude=${id}&limit=3`);
            setRelated(rel.data || []);
        } catch (err) {
            console.error(err);
        }
    }, [id, shouldTrackView]);

    useEffect(() => {
        window.scrollTo(0, 0);
        loadProduct({ trackView: true });
    }, [loadProduct]);

    useEffect(() => {
        const refreshWhenVisible = () => {
            if (document.visibilityState === 'visible') {
                loadProduct({ trackView: false });
            }
        };

        const intervalId = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                loadProduct({ trackView: false });
            }
        }, 10000);

        window.addEventListener('focus', refreshWhenVisible);
        document.addEventListener('visibilitychange', refreshWhenVisible);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener('focus', refreshWhenVisible);
            document.removeEventListener('visibilitychange', refreshWhenVisible);
        };
    }, [loadProduct]);

    // 2. Viết hàm xử lý thêm vào giỏ hàng
    const handleAddToCart = () => {
        if (!product) return;

        if (!isAuthenticated) {
            navigate('/auth/login', { state: { from: `/product/${product._id}` } });
            return;
        }

        if (stock <= 0) {
            alert('Sản phẩm đã hết hàng!');
            return;
        }

        dispatch(addToCart({
            productId: product._id, // Lấy ID của sản phẩm hiện tại
            quantity: quantity,     // Lấy số lượng từ state quantity bạn đang chọn
            price: product.price
        }))
            .unwrap()
            .then(() => {
                alert("Đã thêm sản phẩm vào giỏ hàng thành công!");
                loadProduct({ trackView: false });
            })
            .catch((error) => {
                alert("Lỗi khi thêm vào giỏ hàng: " + (error?.message || "Vui lòng đăng nhập"));
            });
    };

    if (!product) return <div className="text-center pt-32 h-screen flex justify-center items-center">Đang tải dữ liệu...</div>;

    return (
        <div className="bg-surface text-on-surface flex flex-col min-h-screen">
            <Header />

            <main className="flex-grow pt-32 pb-section-padding px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto w-full">
                {/* Breadcrumbs */}
                <div className="mb-8 font-label-sm text-on-surface-variant flex items-center gap-2">
                    <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className="text-primary">{product.name}</span>
                </div>

                {!isAuthenticated && (
                    <div className="mb-6 rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4 text-sm text-sky-800">
                        Bạn đang xem với tư cách khách. Vui lòng đăng nhập hoặc đăng ký để mua sản phẩm này.
                    </div>
                )}

                {/* Product Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
                    {/* HÌNH ẢNH (SWIPER) */}
                    <div className="lg:col-span-7 flex flex-col gap-base">
                        <div className="bg-white w-full aspect-square max-h-[620px] rounded flex items-center justify-center overflow-hidden shadow-sm border border-surface-variant">
                            <Swiper modules={[Navigation, Pagination]} navigation pagination className="w-full h-full [&_.swiper-slide]:flex [&_.swiper-slide]:items-center [&_.swiper-slide]:justify-center">
                                {product.images?.length > 0 ? product.images.map((img, idx) => (
                                    <SwiperSlide key={idx}>
                                        <div className="w-full h-full p-4 sm:p-6 flex items-center justify-center bg-white">
                                            <img
                                                src={getProductImageUrl(img)}
                                                alt={product.name || 'Product'}
                                                className="block w-full h-full object-cover object-center rounded-sm"
                                                loading="lazy"
                                                onError={(event) => {
                                                    event.currentTarget.src = PLACEHOLDER_IMAGE;
                                                }}
                                            />
                                        </div>
                                    </SwiperSlide>
                                )) : (
                                    <SwiperSlide className="flex items-center justify-center text-gray-400">Chưa có hình ảnh</SwiperSlide>
                                )}
                            </Swiper>
                        </div>
                    </div>

                    {/* CHI TIẾT */}
                    <div className="lg:col-span-5 flex flex-col pt-8 lg:pt-0">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="px-3 py-1 bg-surface-container-high text-on-surface font-label-sm rounded uppercase tracking-widest">{product.category}</span>
                            <span className="font-label-sm text-on-surface-variant flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px] text-secondary">local_fire_department</span>
                                Đã bán: {product.sold || 0} | Tồn kho: {stock}
                            </span>
                        </div>

                        {lastUpdated && (
                            <p className="mb-3 text-xs text-on-surface-variant">
                                Tồn kho cập nhật lúc: {lastUpdated.toLocaleTimeString('vi-VN')}
                            </p>
                        )}

                        <h1 className="font-display-lg text-[40px] text-primary mb-2 leading-tight">{product.name}</h1>
                        <p className="font-headline-md text-[32px] text-primary mb-8">{product.price?.toLocaleString()} VNĐ</p>

                        <p className="mb-8 font-body-lg text-on-surface-variant leading-relaxed">
                            {product.description}
                        </p>

                        {/* Mua hàng */}
                        <div className="flex items-center gap-6 mb-12 border-t border-b border-surface-variant py-6">
                            <div className="flex items-center border border-outline-variant rounded">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 text-on-surface-variant hover:bg-surface-container transition-colors">-</button>
                                <span className="w-12 text-center font-body-md">{quantity}</span>
                                <button onClick={() => setQuantity(q => Math.min(stock || 1, q + 1))} className="p-3 text-on-surface-variant hover:bg-surface-container transition-colors">+</button>
                            </div>

                            {/* 3. GẮN SỰ KIỆN onClick VÀO NÚT NÀY */}
                            <button
                                onClick={handleAddToCart}
                                disabled={isAuthenticated && stock === 0}
                                className="flex-1 bg-primary text-white py-4 px-8 font-label-sm uppercase tracking-widest hover:bg-primary-container transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined">shopping_bag</span>
                                {!isAuthenticated ? 'ĐĂNG NHẬP ĐỂ MUA' : stock === 0 ? "HẾT HÀNG" : "THÊM VÀO GIỎ"}
                            </button>
                        </div>

                        {!isAuthenticated && (
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Link to="/auth/login" state={{ from: `/product/${product._id}` }} className="flex-1 rounded-xl border border-primary px-5 py-3 text-center text-sm font-bold text-primary hover:bg-primary hover:text-white">
                                    Đăng nhập
                                </Link>
                                <Link to="/auth/register" className="flex-1 rounded-xl border border-surface-variant px-5 py-3 text-center text-sm font-bold text-on-surface-variant hover:bg-surface-container-lowest">
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* SẢN PHẨM TƯƠNG TỰ */}
                <section className="mt-section-padding pt-16 border-t border-surface-variant">
                    <h2 className="font-headline-md text-[32px] text-primary text-center mb-12">Sản Phẩm Cùng Danh Mục</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                        {related.map(item => (
                            <Link to={`/product/${item._id}`} key={item._id} className="group cursor-pointer">
                                <div className="bg-white w-full aspect-[4/5] flex items-center justify-center p-4 mb-6 transition-transform hover:-translate-y-1 shadow-sm overflow-hidden border border-surface-variant">
                                    <img
                                        src={getProductImageUrl(item)}
                                        alt={item.name || 'Sản phẩm'}
                                        className="w-full h-full object-cover object-center rounded-sm group-hover:scale-105 transition-transform"
                                        loading="lazy"
                                        onError={(event) => {
                                            event.currentTarget.src = PLACEHOLDER_IMAGE;
                                        }}
                                    />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-headline-md text-[20px] text-primary mb-2">{item.name}</h3>
                                    <p className="font-body-md text-primary">{item.price?.toLocaleString()} VNĐ</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default ProductDetailPage;
