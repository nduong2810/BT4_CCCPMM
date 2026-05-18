import React, { useState } from 'react';

const SearchFilter = ({ onFilter }) => {
    const [filters, setFilters] = useState({ keyword: '', category: '', minPrice: '', maxPrice: '' });

    const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
    const handleSubmit = (e) => { e.preventDefault(); onFilter(filters); };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow flex flex-col gap-4">
            <h3 className="font-bold border-b pb-2">BỘ LỌC TÌM KIẾM</h3>
            <div>
                <label className="text-sm font-medium">Tên sản phẩm</label>
                <input type="text" name="keyword" value={filters.keyword} onChange={handleChange} className="w-full border p-2 rounded mt-1" placeholder="Nhập tên..." />
            </div>
            <div>
                <label className="text-sm font-medium">Danh mục</label>
                <select name="category" value={filters.category} onChange={handleChange} className="w-full border p-2 rounded mt-1">
                    <option value="">Tất cả</option>
                    <option value="DienThoai">Điện Thoại</option>
                    <option value="Laptop">Laptop</option>
                </select>
            </div>
            <div>
                <label className="text-sm font-medium">Khoảng giá</label>
                <div className="flex gap-2 mt-1">
                    <input type="number" name="minPrice" placeholder="Từ" value={filters.minPrice} onChange={handleChange} className="w-1/2 border p-2 rounded" />
                    <input type="number" name="maxPrice" placeholder="Đến" value={filters.maxPrice} onChange={handleChange} className="w-1/2 border p-2 rounded" />
                </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">LỌC</button>
        </form>
    );
};
export default SearchFilter;