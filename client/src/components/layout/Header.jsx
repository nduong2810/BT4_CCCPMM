import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
//import { logout } from '../../store/slices/authSlice';

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const authState = useSelector((state) => state.auth);
    const user = authState?.user || null;

    const handleLogout = () => {
        dispatch(logout());
        navigate('/auth/login');
    };

    return (
        <nav className="bg-surface/80 backdrop-blur-md shadow-sm fixed top-0 w-full z-50 transition-all duration-300 ease-out">
            <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 max-w-7xl mx-auto">

                {/* Brand Logo */}
                <Link to="/" className="font-display-lg text-headline-md tracking-tighter text-primary">
                    HOROLOGUE
                </Link>

                {/* Desktop Navigation Links */}
                <div className="hidden md:flex gap-8 items-center font-label-sm text-label-sm">
                    <Link to="/" className="text-secondary border-b border-secondary pb-1 transition-all duration-300 ease-out">Bộ sưu tập</Link>
                    <a href="#" className="text-on-surface-variant hover:text-secondary transition-colors duration-500 ease-in-out">Di sản</a>
                    <a href="#" className="text-on-surface-variant hover:text-secondary transition-colors duration-500 ease-in-out">Cửa hàng</a>
                    <a href="#" className="text-on-surface-variant hover:text-secondary transition-colors duration-500 ease-in-out">Dịch vụ</a>
                </div>

                {/* Trailing Icons */}
                <div className="flex gap-4 items-center text-primary">
                    <button aria-label="Search" className="hover:text-secondary transition-colors duration-500 ease-in-out">
                        <span className="material-symbols-outlined">search</span>
                    </button>

                    {/* Icon User & Dropdown Menu */}
                    <div className="relative group flex items-center h-full py-4">
                        <button aria-label="Profile" className="hover:text-secondary transition-colors duration-500 ease-in-out">
                            <span className="material-symbols-outlined">person</span>
                        </button>

                        {/* Khối Dropdown mượt mà từ thiết kế gốc của bạn */}
                        <div className="absolute top-full right-0 mt-[-10px] w-48 bg-surface-container-lowest shadow-sm rounded border border-surface-variant opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out">
                            <div className="p-4 flex flex-col space-y-3">
                                {user ? (
                                    <>
                    <span className="font-label-sm text-label-sm text-primary border-b border-surface-variant pb-2 truncate">
                      Chào, {user.fullName || 'Thành viên'}
                    </span>
                                        <Link to="/user/profile" className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary">Tài khoản</Link>
                                        <a href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary">Đơn hàng</a>
                                        <hr className="border-surface-variant" />
                                        <button onClick={handleLogout} className="font-label-sm text-label-sm text-error hover:text-error-container transition-colors text-left">Đăng xuất</button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/auth/login" className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary">Đăng nhập</Link>
                                        <Link to="/auth/register" className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary">Đăng ký</Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <button aria-label="Cart" className="hover:text-secondary transition-colors duration-500 ease-in-out">
                        <span className="material-symbols-outlined">shopping_bag</span>
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden hover:text-secondary transition-colors duration-500 ease-in-out">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>

            </div>
        </nav>
    );
};

export default Header;