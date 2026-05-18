import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-surface-container-lowest pt-section-padding pb-8 mt-auto border-t border-surface-variant/30">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto">

                {/* Cột 1: Brand & Giới thiệu */}
                <div className="md:col-span-1 flex flex-col">
                    <Link to="/" className="font-display-lg text-headline-md mb-8 block text-primary tracking-tighter">
                        HOROLOGUE
                    </Link>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-4 max-w-xs leading-relaxed">
                        Kiệt tác thời gian, được chế tác tinh xảo với độ chính xác tuyệt đối và di sản lâu đời dành cho những người sành sỏi.
                    </p>
                </div>

                {/* Cột 2: Khám phá */}
                <div className="flex flex-col gap-4 mt-8 md:mt-0">
                    <h4 className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-2 border-b border-surface-variant pb-2 inline-block w-max">
                        Khám Phá
                    </h4>
                    <a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors duration-300">
                        Thương hiệu Maison
                    </a>
                    <a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors duration-300">
                        Nghệ thuật Chế tác
                    </a>
                    <a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors duration-300">
                        Bộ sưu tập mới
                    </a>
                </div>

                {/* Cột 3: Hỗ trợ */}
                <div className="flex flex-col gap-4 mt-8 md:mt-0">
                    <h4 className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-2 border-b border-surface-variant pb-2 inline-block w-max">
                        Hỗ Trợ
                    </h4>
                    <a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors duration-300">
                        Liên hệ chúng tôi
                    </a>
                    <a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors duration-300">
                        Tìm kiếm Cửa hàng
                    </a>
                    <a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors duration-300">
                        Chính sách Bảo mật
                    </a>
                    <a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors duration-300">
                        Điều khoản Dịch vụ
                    </a>
                </div>

                {/* Cột 4: Đăng ký nhận tin độc quyền */}
                <div className="flex flex-col gap-4 mt-8 md:mt-0">
                    <h4 className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-2 border-b border-surface-variant pb-2 inline-block w-max">
                        Bản Tin
                    </h4>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                        Đăng ký để nhận lời mời tham gia các buổi triển lãm riêng tư và cập nhật về các phiên bản đồng hồ giới hạn.
                    </p>
                    <form onSubmit={(e) => e.preventDefault()} className="flex border-b border-outline-variant mt-2 focus-within:border-secondary transition-colors duration-300">
                        <input
                            className="bg-transparent border-none focus:ring-0 w-full py-2 px-0 font-body-md text-body-md placeholder-on-surface-variant/50 text-primary outline-none"
                            placeholder="Địa chỉ Email của bạn"
                            type="email"
                            required
                        />
                        <button type="submit" className="text-primary hover:text-secondary transition-colors duration-300 px-2 flex items-center">
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </form>
                </div>

            </div>

            {/* Bản quyền & Ngôn ngữ phía dưới */}
            <div className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto mt-16 pt-8 border-t border-surface-variant text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">
                    © {new Date().getFullYear()} HOROLOGUE. TẤT CẢ QUYỀN ĐƯỢC BẢO LƯU.
                </p>
                <div className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-sm">language</span>
                    <span className="font-label-sm text-label-sm uppercase">VN</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;