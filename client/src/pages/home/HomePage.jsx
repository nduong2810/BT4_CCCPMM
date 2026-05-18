import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../lib/apiClient';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer'; // Import Footer

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({ keyword: '', category: '' });

    useEffect(() => {
        fetchProducts();
    }, [filters]);

    const fetchProducts = async () => {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const res = await apiClient.get(`/products?${queryParams}&sort=createdAt:-1`);
            setProducts(res.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="bg-surface text-on-surface antialiased flex flex-col min-h-screen pt-20">
            {/* HEADER */}
            <Header />

            <main className="flex-grow">
                {/* HERO SECTION */}
                <section className="relative w-full h-[819px] min-h-[600px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img alt="Hero" className="w-full h-full object-cover opacity-90" src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2080&auto=format&fit=crop" />
                        <div className="absolute inset-0 bg-surface/30"></div>
                    </div>
                    <div className="relative z-10 text-center px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto flex flex-col items-center">
                        <span className="font-label-sm text-label-sm text-primary mb-4 tracking-widest uppercase">Bộ sưu tập Astral</span>
                        <h1 className="font-display-lg text-primary mb-8 leading-tight">Đỉnh Cao Thời Gian</h1>
                        <p className="font-body-lg text-on-surface-variant mb-12 max-w-xl">Khám phá những cỗ máy thời gian được chế tác thủ công với độ chính xác tuyệt đối và thiết kế vượt thời gian.</p>
                        <a href="#shop" className="bg-primary text-on-primary font-label-sm px-8 py-4 uppercase tracking-wider hover:bg-secondary transition-colors">
                            Khám Phá Ngay
                        </a>
                    </div>
                </section>

                {/* SHOP SECTION */}
                <section id="shop" className="max-w-7xl mx-auto w-full px-margin-mobile md:px-margin-desktop py-section-padding flex flex-col gap-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-outline-variant pb-6">
                        <div>
                            <h2 className="font-headline-md text-primary">Cửa hàng Đồng hồ</h2>
                            <p className="font-body-md text-on-surface-variant">Tìm thấy {products.length} sản phẩm.</p>
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
                                        <input type="radio" name="category" value="Nu" onChange={handleFilterChange} checked={filters.category === 'Nu'} className="w-4 h-4 text-primary focus:ring-primary" />
                                        <span>Đồng hồ Nữ</span>
                                    </label>
                                </div>
                            </div>
                        </aside>

                        {/* PRODUCT GRID */}
                        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                            {products.map(item => (
                                <Link to={`/product/${item._id}`} key={item._id} className="group flex flex-col items-center text-center cursor-pointer">
                                    <div className="w-full aspect-[4/5] bg-surface-container-lowest relative mb-6 overflow-hidden flex items-center justify-center transition-transform duration-500 hover:scale-[1.02] shadow-sm">
                                        {item.sold > 100 && <div className="absolute top-4 left-4 z-10 px-2 py-1 bg-surface-container-high text-on-surface font-label-sm uppercase tracking-widest">Hot</div>}
                                        <img alt={item.name} src={item.images?.[0] || 'https://via.placeholder.com/300'} className="w-3/4 object-contain transition-transform duration-700 group-hover:scale-105 mix-blend-multiply" />
                                    </div>
                                    <h3 className="font-headline-md text-[24px] text-primary mb-1">{item.name}</h3>
                                    <p className="font-body-md text-on-surface-variant mb-2">Đã bán: {item.sold}</p>
                                    <p className="font-label-sm text-primary tracking-widest">{item.price?.toLocaleString()} VNĐ</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <Footer />
        </div>
    );
};

export default HomePage;