import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../lib/apiClient';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

// =====================================================================
// COMPONENT MỚI: THANH TRƯỢT NGANG CÓ DẤU CHẤM (THAY THẾ MŨI TÊN)
// =====================================================================
const HorizontalSlider = ({ title, iconName, listData }) => {
    const sliderRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    if (!listData || listData.length === 0) return null;

    // Cài đặt cuộn 2 sản phẩm mỗi lần bấm, từ đó tính ra số lượng dấu chấm cần thiết
    const itemsPerScroll = 2;
    const totalDots = Math.ceil(listData.length / itemsPerScroll);

    // Lắng nghe sự kiện cuộn để làm sáng dấu chấm tương ứng
    const handleScroll = () => {
        if (sliderRef.current) {
            const scrollLeft = sliderRef.current.scrollLeft;
            const scrollAmount = 304 * itemsPerScroll; // 280px (width) + 24px (gap)
            const newIndex = Math.round(scrollLeft / scrollAmount);
            setActiveIndex(newIndex);
        }
    };

    // Hàm cuộn tới vị trí khi click vào dấu chấm
    const scrollToDot = (dotIndex) => {
        if (sliderRef.current) {
            const scrollAmount = 304 * itemsPerScroll;
            sliderRef.current.scrollTo({
                left: dotIndex * scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="max-w-7xl mx-auto w-full px-margin-mobile md:px-margin-desktop py-10 relative border-b border-outline-variant">
            {/* TIÊU ĐỀ (Đã bỏ 2 nút mũi tên) */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline-md text-primary flex items-center gap-2 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-secondary">{iconName}</span>
                    {title}
                </h2>
            </div>

            {/* DANH SÁCH SẢN PHẨM TRƯỢT */}
            <div
                ref={sliderRef}
                onScroll={handleScroll}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {listData.map((item, index) => (
                    <Link to={`/product/${item._id}`} key={item._id} className="w-[280px] shrink-0 snap-start group flex flex-col items-center text-center bg-surface-container-lowest p-4 border border-outline-variant/30 hover:shadow-md transition duration-300 relative">
                        <div className="absolute top-4 left-4 z-10 bg-secondary text-on-secondary text-[11px] px-2 py-0.5 font-bold rounded-sm shadow">
                            TOP {index + 1}
                        </div>
                        <div className="relative w-full aspect-[4/5] bg-surface-container-lowest overflow-hidden flex items-center justify-center mb-4">
                            <img alt={item.name} src={item.images?.[0] || 'https://via.placeholder.com/300'} className="w-3/4 object-contain transition-transform duration-500 group-hover:scale-105" />
                        </div>
                        <h3 className="font-headline-md text-[16px] text-primary truncate w-full mb-1">{item.name}</h3>
                        <p className="text-xs text-on-surface-variant mb-2">
                            {iconName === 'local_fire_department' ? `Đã bán: ${item.sold}` : `Lượt xem: ${item.views || 0}`}
                        </p>
                        <p className="font-label-sm text-secondary tracking-wider font-semibold">
                            {item.price?.toLocaleString('vi-VN')} VNĐ
                        </p>
                    </Link>
                ))}
            </div>

            {/* DẤU CHẤM (DOTS) CĂN GIỮA DƯỚI ĐÁY */}
            {totalDots > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                    {Array.from({ length: totalDots }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => scrollToDot(idx)}
                            className={`h-2.5 rounded-full transition-all duration-300 ${
                                activeIndex === idx ? 'w-8 bg-secondary' : 'w-2.5 bg-outline-variant hover:bg-outline'
                            }`}
                            aria-label={`Trang ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// =====================================================================
// COMPONENT CHÍNH: HOME PAGE
// =====================================================================
const HomePage = () => {
    // ---------------- STATES ---------------- //
    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({ keyword: '', category: '', minPrice: '', maxPrice: '' });
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [homeData, setHomeData] = useState({ latest: [], promotions: [] });
    const [highlightData, setHighlightData] = useState({ topSold: [], topViews: [] });

    // ---------------- EFFECTS ---------------- //
    useEffect(() => {
        fetchHomeData();
        fetchTopHighlights();
    }, []);

    useEffect(() => {
        setProducts([]);
        setPage(1);
        setHasMore(true);
        loadShopProducts(1, filters, true);
    }, [filters]);

    useEffect(() => {
        if (page > 1) {
            loadShopProducts(page, filters, false);
        }
    }, [page]);

    useEffect(() => {
        const handleScroll = () => {
            const isBottom = window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 150;
            if (isBottom && !loadingMore && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loadingMore, hasMore]);

    // ---------------- API CALLS ---------------- //
    const loadShopProducts = async (pageNumber, currentFilters, isReset = false) => {
        setLoadingMore(true);
        try {
            const queryParams = new URLSearchParams(currentFilters).toString();
            const res = await apiClient.get(`/products/lazy-load?${queryParams}&page=${pageNumber}&limit=6`);
            if (res.data.success) {
                if (isReset) {
                    setProducts(res.data.products);
                } else {
                    setProducts(prev => [...prev, ...res.data.products]);
                }
                setHasMore(res.data.hasMore);
            }
        } catch (error) {
            console.error("Lỗi lazy loading shop:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const fetchHomeData = async () => {
        try {
            const res = await apiClient.get('/products/home-products');
            if (res.data.success) {
                setHomeData(res.data.data);
            }
        } catch (error) {
            console.error("Lỗi lấy dữ liệu trang chủ:", error);
        }
    };

    const fetchTopHighlights = async () => {
        try {
            const res = await apiClient.get('/products/top-highlights');
            if (res.data.success) {
                setHighlightData(res.data.data);
            }
        } catch (error) {
            console.error("Lỗi lấy Top sản phẩm:", error);
        }
    };

    // ---------------- HANDLERS ---------------- //
    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        const rawValue = value.replace(/\D/g, '');
        setFilters({ ...filters, [name]: rawValue });
    };

    const formatCategory = (cat) => {
        if (!cat) return "Đồng hồ cao cấp";
        if (cat === "Nam") return "Đồng hồ Nam";
        if (cat === "Nữ" || cat === "Nu") return "Đồng hồ Nữ";
        if (cat === "Smartwatch") return "Smartwatch";
        return cat;
    };

    // ---------------- RENDER MỤC NỔI BẬT KHÁC ---------------- //
    const renderHighlightSection = (title, productList) => {
        if (!productList || productList.length === 0) return null;
        return (
            <section className="max-w-7xl mx-auto w-full px-margin-mobile md:px-margin-desktop py-12 border-b border-outline-variant">
                <h2 className="font-headline-md text-primary mb-8 text-center uppercase tracking-widest">{title}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {productList.map(item => (
                        <Link to={`/product/${item._id}`} key={item._id} className="group flex flex-col items-center text-center cursor-pointer">
                            <div className="w-full aspect-[4/5] bg-surface-container-lowest relative mb-6 overflow-hidden flex items-center justify-center transition-transform duration-500 hover:scale-[1.02] shadow-sm border border-surface-variant/50">
                                {item.discount > 0 && <div className="absolute top-4 left-4 z-10 px-2 py-1 bg-red-500 text-white font-label-sm text-[10px] rounded">-{item.discount}%</div>}
                                <img alt={item.name} src={item.images?.[0] || 'https://via.placeholder.com/300'} className="w-3/4 object-contain transition-transform duration-700 group-hover:scale-105 mix-blend-multiply" />
                            </div>
                            <h3 className="font-headline-md text-[18px] text-primary mb-1 truncate w-full px-2">{item.name}</h3>
                            <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">{formatCategory(item.category)}</p>
                            <p className="font-label-sm text-secondary tracking-widest mt-1">{item.price?.toLocaleString('vi-VN')} VNĐ</p>
                        </Link>
                    ))}
                </div>
            </section>
        );
    };

    return (
        <div className="bg-surface text-on-surface antialiased flex flex-col min-h-screen pt-20">
            <Header />

            <main className="flex-grow">
                {/* HERO SECTION */}
                <section className="relative w-full h-[819px] min-h-[600px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img alt="Hero" className="w-full h-full object-cover opacity-90" src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2080&auto=format&fit=crop" />
                        <div className="absolute inset-0 bg-surface/30"></div>
                    </div>
                    <div className="relative z-10 text-center px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto flex flex-col items-center">
                        <span className="font-label-sm text-label-sm text-primary mb-4 tracking-widest uppercase text-white drop-shadow-md">Bộ sưu tập Astral</span>
                        <h1 className="font-display-lg text-primary mb-8 leading-tight text-white drop-shadow-lg">Đỉnh Cao Thời Gian</h1>
                        <p className="font-body-lg text-on-surface-variant mb-12 max-w-xl text-gray-200 drop-shadow">Khám phá những cỗ máy thời gian được chế tác thủ công với độ chính xác tuyệt đối và thiết kế vượt thời gian.</p>
                        <a href="#shop" className="bg-primary text-on-primary font-label-sm px-8 py-4 uppercase tracking-wider hover:bg-secondary transition-colors">
                            Khám Phá Ngay
                        </a>
                    </div>
                </section>

                <div className="bg-surface-container-lowest">
                    {/* SỬ DỤNG COMPONENT SLIDER NGANG VỚI DẤU CHẤM */}
                    <HorizontalSlider title="10 Sản phẩm Bán chạy nhất" iconName="local_fire_department" listData={highlightData.topSold} />
                    <HorizontalSlider title="10 Sản phẩm Xem nhiều nhất" iconName="visibility" listData={highlightData.topViews} />

                    {/* CÁC MỤC NỔI BẬT THEO GRID */}
                    {renderHighlightSection("🔥 Khuyến Mãi Đặc Biệt", homeData.promotions)}
                    {renderHighlightSection("✨ Sản Phẩm Mới Nhất", homeData.latest)}
                </div>

                {/* SHOP SECTION */}
                <section id="shop" className="max-w-7xl mx-auto w-full px-margin-mobile md:px-margin-desktop py-section-padding flex flex-col gap-12 mt-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-outline-variant pb-6">
                        <div>
                            <h2 className="font-headline-md text-primary">Cửa hàng Đồng hồ</h2>
                            <p className="font-body-md text-on-surface-variant">Lướt xuống để xem thêm sản phẩm.</p>
                        </div>
                        <input
                            type="text" name="keyword" placeholder="Tìm kiếm tên..."
                            value={filters.keyword} onChange={handleFilterChange}
                            className="bg-transparent border-b border-outline-variant py-2 focus:outline-none focus:border-secondary"
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-gutter">
                        {/* SIDEBAR LỌC */}
                        <aside className="hidden md:flex flex-col w-64 shrink-0 gap-8 sticky top-28 h-max">
                            <div className="flex flex-col gap-4">
                                <h3 className="font-label-sm text-primary border-b border-surface-variant pb-2">DANH MỤC</h3>
                                <div className="flex flex-col gap-3 font-body-md text-on-surface-variant">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="radio" name="category" value="" onChange={handleFilterChange} checked={filters.category === ''} className="w-4 h-4 text-primary focus:ring-primary" />
                                        <span>Tất cả</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="radio" name="category" value="Nam" onChange={handleFilterChange} checked={filters.category === 'Nam'} className="w-4 h-4 text-primary focus:ring-primary" />
                                        <span>Đồng hồ Nam</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="radio" name="category" value="Nữ" onChange={handleFilterChange} checked={filters.category === 'Nữ'} className="w-4 h-4 text-primary focus:ring-primary" />
                                        <span>Đồng hồ Nữ</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <h3 className="font-label-sm text-primary border-b border-surface-variant pb-2">MỨC GIÁ (VNĐ)</h3>
                                <div className="flex flex-col gap-3 font-body-md text-on-surface-variant">
                                    <input
                                        type="text"
                                        name="minPrice"
                                        placeholder="Giá thấp nhất..."
                                        value={filters.minPrice ? Number(filters.minPrice).toLocaleString('vi-VN') : ''}
                                        onChange={handlePriceChange}
                                        className="w-full bg-transparent border border-outline-variant rounded px-3 py-2 text-sm focus:outline-none focus:border-secondary"
                                    />
                                    <span className="text-center text-xs text-on-surface-variant">ĐẾN</span>
                                    <input
                                        type="text"
                                        name="maxPrice"
                                        placeholder="Giá cao nhất..."
                                        value={filters.maxPrice ? Number(filters.maxPrice).toLocaleString('vi-VN') : ''}
                                        onChange={handlePriceChange}
                                        className="w-full bg-transparent border border-outline-variant rounded px-3 py-2 text-sm focus:outline-none focus:border-secondary"
                                    />
                                </div>
                                {(filters.minPrice || filters.maxPrice) && (
                                    <button
                                        onClick={() => setFilters({ ...filters, minPrice: '', maxPrice: '' })}
                                        className="text-xs text-error hover:underline text-left mt-1"
                                    >
                                        Xóa lọc giá
                                    </button>
                                )}
                            </div>
                        </aside>

                        {/* PRODUCT GRID BÊN PHẢI */}
                        <div className="flex-grow flex flex-col">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                                {products.map(item => (
                                    <Link to={`/product/${item._id}`} key={item._id} className="group flex flex-col items-center text-center cursor-pointer">
                                        <div className="w-full aspect-[4/5] bg-surface-container-lowest relative mb-6 overflow-hidden flex items-center justify-center transition-transform duration-500 hover:scale-[1.02] shadow-sm">
                                            {item.sold > 100 && <div className="absolute top-4 left-4 z-10 px-2 py-1 bg-surface-container-high text-on-surface font-label-sm uppercase tracking-widest">Hot</div>}
                                            <img alt={item.name} src={item.images?.[0] || 'https://via.placeholder.com/300'} className="w-3/4 object-contain transition-transform duration-700 group-hover:scale-105 mix-blend-multiply" />
                                        </div>
                                        <h3 className="font-headline-md text-[20px] text-primary mb-1 truncate w-full px-2">{item.name}</h3>
                                        <p className="text-sm text-secondary uppercase tracking-widest mb-2 border-b border-outline-variant pb-1 inline-block">
                                            {formatCategory(item.category)}
                                        </p>
                                        <p className="font-body-md text-on-surface-variant mb-2">Đã bán: {item.sold}</p>
                                        <p className="font-label-sm text-primary tracking-widest font-semibold">{item.price?.toLocaleString('vi-VN')} VNĐ</p>
                                    </Link>
                                ))}
                            </div>

                            {products.length === 0 && !loadingMore && (
                                <div className="rounded-2xl border border-surface-variant bg-white p-10 text-center text-on-surface-variant">
                                    Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.
                                </div>
                            )}

                            <div className="mt-12 mb-8">
                                {loadingMore && (
                                    <div className="text-center text-secondary font-label-sm animate-pulse">
                                        <span className="material-symbols-outlined animate-spin align-middle mr-2">refresh</span>
                                        Đang tải thêm sản phẩm...
                                    </div>
                                )}
                                {!hasMore && products.length > 0 && (
                                    <div className="text-center text-on-surface-variant/60 font-body-md italic border-t border-outline-variant pt-6">
                                        ✨ Bạn đã xem hết tất cả sản phẩm.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default HomePage;
