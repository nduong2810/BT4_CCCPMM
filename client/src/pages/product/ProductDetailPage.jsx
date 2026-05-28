import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../lib/apiClient';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

// Import Redux hooks và action
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { getProductImageUrl, PLACEHOLDER_IMAGE } from '../../utils/imageUrl';

const ProductDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [quantity, setQuantity] = useState(1);

    // 1. Khai báo dispatch
    const dispatch = useDispatch();

    useEffect(() => {
        window.scrollTo(0, 0);
        apiClient.get(`/products/${id}`).then(res => {
            setProduct(res.data);
            apiClient.get(`/products?category=${res.data.category}&exclude=${id}&limit=3`)
                .then(rel => setRelated(rel.data || []));
        }).catch(err => console.error(err));
    }, [id]);

    // 2. Viết hàm xử lý thêm vào giỏ hàng
    const handleAddToCart = () => {
        if (!product) return;

        dispatch(addToCart({
            productId: product._id, // Lấy ID của sản phẩm hiện tại
            quantity: quantity,     // Lấy số lượng từ state quantity bạn đang chọn
            price: product.price
        }))
            .unwrap()
            .then(() => {
                alert("Đã thêm sản phẩm vào giỏ hàng thành công!");
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
                                Đã bán: {product.sold} | Tồn kho: {product.countInStock}
                            </span>
                        </div>

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
                                <button onClick={() => setQuantity(q => Math.min(product.countInStock, q + 1))} className="p-3 text-on-surface-variant hover:bg-surface-container transition-colors">+</button>
                            </div>

                            {/* 3. GẮN SỰ KIỆN onClick VÀO NÚT NÀY */}
                            <button
                                onClick={handleAddToCart}
                                disabled={product.countInStock === 0}
                                className="flex-1 bg-primary text-white py-4 px-8 font-label-sm uppercase tracking-widest hover:bg-primary-container transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined">shopping_bag</span>
                                {product.countInStock === 0 ? "HẾT HÀNG" : "THÊM VÀO GIỎ"}
                            </button>
                        </div>
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
