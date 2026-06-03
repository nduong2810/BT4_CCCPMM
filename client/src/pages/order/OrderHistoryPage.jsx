import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { cancelMyOrderAPI, getMyOrdersAPI } from '../../services/orderService';

const STATUS_STEPS = [
    { key: 'NEW', label: 'Đơn hàng mới' },
    { key: 'CONFIRMED', label: 'Đã xác nhận đơn hàng' },
    { key: 'PREPARING', label: 'Shop đang chuẩn bị hàng' },
    { key: 'SHIPPING', label: 'Đang giao hàng' },
    { key: 'DELIVERED', label: 'Đã giao thành công' }
];

const BADGE_CLASS = {
    NEW: 'bg-blue-50 text-blue-700 border-blue-200',
    CONFIRMED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    PREPARING: 'bg-amber-50 text-amber-700 border-amber-200',
    SHIPPING: 'bg-purple-50 text-purple-700 border-purple-200',
    DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    CANCELLATION_REQUESTED: 'bg-orange-50 text-orange-700 border-orange-200'
};

const formatCurrency = (value) => `${Number(value || 0).toLocaleString()} VNĐ`;
const formatDate = (value) => new Date(value).toLocaleString('vi-VN');

const OrderStepper = ({ status }) => {
    const activeIndex = STATUS_STEPS.findIndex(step => step.key === status);
    const isSpecialEnd = ['CANCELLED', 'CANCELLATION_REQUESTED'].includes(status);

    return (
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-5">
            {STATUS_STEPS.map((step, index) => {
                const done = !isSpecialEnd && activeIndex >= index;
                const current = status === step.key;

                return (
                    <div key={step.key} className="flex items-center gap-3 md:block">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${done ? 'border-primary bg-primary text-white' : 'border-surface-variant bg-white text-on-surface-variant'}`}>
                            {index + 1}
                        </div>
                        <p className={`mt-0 text-sm font-medium md:mt-2 ${current ? 'text-primary' : 'text-on-surface-variant'}`}>{step.label}</p>
                    </div>
                );
            })}
        </div>
    );
};

const OrderCard = ({ order, onCancel }) => {
    const [showReason, setShowReason] = useState(false);
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const firstImage = order.items?.[0]?.product?.images?.[0] || 'https://via.placeholder.com/150';
    const cancelInfo = order.cancelInfo || {};
    const canCancel = cancelInfo.canCancelDirectly || cancelInfo.canRequestCancel;

    const handleCancel = async () => {
        setSubmitting(true);
        try {
            await onCancel(order._id, reason);
            setShowReason(false);
            setReason('');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <article className="rounded-2xl border border-surface-variant bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-surface-variant bg-white p-1">
                        <img src={firstImage} alt="Sản phẩm" className="h-full w-full object-cover mix-blend-multiply" />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-bold text-primary">Đơn hàng #{order._id?.slice(-8).toUpperCase()}</h2>
                            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${BADGE_CLASS[order.status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                {order.statusLabel || order.status}
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-on-surface-variant">Ngày đặt: {formatDate(order.createdAt)}</p>
                        <p className="mt-1 text-sm text-on-surface-variant">{order.items?.length || 0} sản phẩm • COD</p>
                        <p className="mt-3 text-lg font-bold text-primary">{formatCurrency(order.totalAmount)}</p>
                    </div>
                </div>

                {canCancel && (
                    <button
                        type="button"
                        onClick={() => setShowReason(!showReason)}
                        className="rounded-xl border border-error px-4 py-2 text-sm font-bold text-error transition-colors hover:bg-red-50"
                    >
                        {cancelInfo.canRequestCancel ? 'Gửi yêu cầu hủy' : 'Hủy đơn hàng'}
                    </button>
                )}
            </div>

            {order.status === 'DELIVERED' && (
                <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
                    Đơn hàng đã giao thành công. Cảm ơn bạn đã mua hàng.
                </div>
            )}

            {order.status === 'CANCELLED' && (
                <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                    Đơn hàng đã bị hủy{order.cancelReason ? `: ${order.cancelReason}` : ''}.
                </div>
            )}

            {order.status === 'CANCELLATION_REQUESTED' && (
                <div className="mt-4 rounded-xl bg-orange-50 p-4 text-sm text-orange-700">
                    Yêu cầu hủy đã được gửi cho shop. Shop sẽ kiểm tra và phản hồi sau.
                </div>
            )}

            {canCancel && !showReason && (
                <p className="mt-4 text-sm text-on-surface-variant">
                    {cancelInfo.canCancelDirectly
                        ? `Bạn còn khoảng ${cancelInfo.remainingMinutes} phút để hủy trực tiếp đơn hàng.`
                        : 'Đơn đang ở bước shop chuẩn bị hàng, thao tác này sẽ gửi yêu cầu hủy cho shop.'}
                </p>
            )}

            {showReason && (
                <div className="mt-4 rounded-xl border border-surface-variant bg-surface-container-lowest p-4">
                    <label className="block text-sm font-bold text-primary">Lý do hủy đơn</label>
                    <textarea
                        rows="3"
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Nhập lý do hủy đơn..."
                        className="mt-2 w-full resize-none rounded-xl border border-outline-variant bg-white px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                    <div className="mt-3 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={submitting}
                            className="rounded-xl bg-error px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                        >
                            {submitting ? 'Đang xử lý...' : 'Xác nhận'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowReason(false)}
                            className="rounded-xl border border-surface-variant px-4 py-2 text-sm font-bold text-on-surface-variant"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            <OrderStepper status={order.status} />

            <details className="mt-5 rounded-xl border border-surface-variant p-4">
                <summary className="cursor-pointer font-bold text-primary">Xem chi tiết đơn hàng</summary>
                <div className="mt-4 space-y-4">
                    {order.items?.map((item) => (
                        <div key={`${order._id}-${item.product?._id}`} className="flex items-center justify-between gap-4 border-b border-surface-variant pb-3 last:border-b-0 last:pb-0">
                            <div>
                                <p className="font-semibold text-primary">{item.product?.name || 'Sản phẩm'}</p>
                                <p className="text-sm text-on-surface-variant">Số lượng: {item.quantity}</p>
                            </div>
                            <p className="font-bold text-secondary">{formatCurrency(item.price)}</p>
                        </div>
                    ))}

                    <div className="rounded-xl bg-surface-container-lowest p-4 text-sm text-on-surface-variant">
                        <p className="font-bold text-primary">Thông tin nhận hàng</p>
                        <p>{order.shippingAddress?.fullName} - {order.shippingAddress?.phone}</p>
                        <p>{order.shippingAddress?.address}</p>
                    </div>

                    <div>
                        <p className="mb-2 font-bold text-primary">Lịch sử trạng thái</p>
                        <div className="space-y-3">
                            {order.statusHistory?.map((history, index) => (
                                <div key={`${history.status}-${history.changedAt}-${index}`} className="rounded-lg bg-surface-container-lowest p-3 text-sm">
                                    <p className="font-bold text-primary">{history.label}</p>
                                    <p className="text-on-surface-variant">{formatDate(history.changedAt)}{history.note ? ` • ${history.note}` : ''}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </details>
        </article>
    );
};

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [lastUpdated, setLastUpdated] = useState(null);

    const loadOrders = useCallback(async (showFullLoading = false) => {
        if (showFullLoading) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        setError('');
        try {
            const response = await getMyOrdersAPI();
            setOrders(response.data.orders || []);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải lịch sử đơn hàng');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
        loadOrders(true);
    }, [loadOrders]);

    useEffect(() => {
        const refreshWhenVisible = () => {
            if (document.visibilityState === 'visible') {
                loadOrders(false);
            }
        };

        const intervalId = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                loadOrders(false);
            }
        }, 10000);

        window.addEventListener('focus', refreshWhenVisible);
        document.addEventListener('visibilitychange', refreshWhenVisible);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener('focus', refreshWhenVisible);
            document.removeEventListener('visibilitychange', refreshWhenVisible);
        };
    }, [loadOrders]);

    const filteredOrders = useMemo(() => {
        if (filter === 'ALL') return orders;
        return orders.filter(order => order.status === filter);
    }, [orders, filter]);

    const handleCancel = async (orderId, reason) => {
        await cancelMyOrderAPI(orderId, reason);
        await loadOrders(false);
    };

    return (
        <div className="flex min-h-screen flex-col bg-surface text-on-surface">
            <Header />
            <main className="mx-auto w-full max-w-[1280px] flex-grow px-margin-mobile pb-section-padding pt-32 md:px-margin-desktop">
                <div className="mb-6">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary">
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Tiếp tục mua sắm
                    </Link>
                </div>

                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.25em] text-secondary">Theo dõi đơn hàng</p>
                        <h1 className="mt-2 text-3xl font-display-lg text-primary">Lịch sử mua hàng</h1>
                        <p className="mt-2 max-w-2xl text-on-surface-variant">
                            Xem lại toàn bộ đơn hàng, tiến trình xử lý và thực hiện hủy đơn theo thời hạn cho phép.
                        </p>
                        <p className="mt-2 text-sm text-on-surface-variant">
                            {lastUpdated ? `Cập nhật lần cuối: ${formatDate(lastUpdated)}` : 'Đang đồng bộ trạng thái đơn hàng...'}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <button
                            type="button"
                            onClick={() => loadOrders(false)}
                            disabled={refreshing}
                            className="rounded-xl border border-surface-variant bg-white px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-surface-container-lowest disabled:opacity-60"
                        >
                            {refreshing ? 'Đang cập nhật...' : 'Làm mới'}
                        </button>
                        <select
                            value={filter}
                            onChange={(event) => setFilter(event.target.value)}
                            className="rounded-xl border border-surface-variant bg-white px-4 py-3 text-sm font-bold text-primary outline-none focus:border-primary"
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="NEW">Đơn hàng mới</option>
                            <option value="CONFIRMED">Đã xác nhận</option>
                            <option value="PREPARING">Đang chuẩn bị</option>
                            <option value="SHIPPING">Đang giao</option>
                            <option value="DELIVERED">Đã giao</option>
                            <option value="CANCELLED">Đã hủy</option>
                            <option value="CANCELLATION_REQUESTED">Yêu cầu hủy</option>
                        </select>
                    </div>
                </div>

                {refreshing && !loading && (
                    <div className="mb-4 rounded-xl border border-surface-variant bg-white px-4 py-3 text-sm font-medium text-on-surface-variant">
                        Đang kiểm tra trạng thái đơn hàng mới nhất...
                    </div>
                )}

                {loading && <div className="rounded-2xl border border-surface-variant bg-white p-8 text-center font-bold text-primary">Đang tải đơn hàng...</div>}

                {!loading && error && <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>}

                {!loading && !error && filteredOrders.length === 0 && (
                    <div className="rounded-2xl border border-surface-variant bg-white p-10 text-center">
                        <span className="material-symbols-outlined text-5xl text-on-surface-variant">receipt_long</span>
                        <h2 className="mt-3 text-xl font-bold text-primary">Chưa có đơn hàng nào</h2>
                        <p className="mt-2 text-on-surface-variant">Khi đặt hàng thành công, đơn hàng sẽ hiển thị tại đây.</p>
                    </div>
                )}

                {!loading && !error && filteredOrders.length > 0 && (
                    <div className="space-y-5">
                        {filteredOrders.map(order => (
                            <OrderCard key={order._id} order={order} onCancel={handleCancel} />
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default OrderHistoryPage;
