import Product from '../model/product.model.js';

export const getProducts = async (req, res) => {
    try {
        // 1. Lấy các tham số lọc từ URL (query params)
        const { keyword, category, minPrice, maxPrice, sort } = req.query;

        // 2. Tạo đối tượng query để truy vấn MongoDB
        let query = {};

        // - Lọc theo từ khóa (Tìm kiếm tên sản phẩm có chứa từ khóa, không phân biệt hoa thường)
        if (keyword) {
            query.name = { $regex: keyword, $options: 'i' };
        }

        // - Lọc theo danh mục
        if (category) {
            query.category = category;
        }

        // - Lọc theo khoảng giá (minPrice đến maxPrice)
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice); // Lớn hơn hoặc bằng
            if (maxPrice) query.price.$lte = Number(maxPrice); // Nhỏ hơn hoặc bằng
        }

        // 3. Xử lý sắp xếp (Mặc định hiển thị mới nhất)
        let sortQuery = { createdAt: -1 };
        if (sort) {
            const [field, order] = sort.split(':');
            sortQuery[field] = Number(order); // VD: Nếu FE gửi lên sort=price:1 -> sắp xếp giá tăng dần
        }

        // 4. Thực thi truy vấn
        const products = await Product.find(query).sort(sortQuery);

        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ message: "Lỗi lấy danh sách sản phẩm", error: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Không tìm thấy" });
        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({ message: "Lỗi Server", error: error.message });
    }
};

export const getHomeProducts = async (req, res) => {
    try {
        // 1. Lấy 4 sản phẩm mới nhất (sắp xếp theo createdAt giảm dần)
        const latest = await Product.find().sort({ createdAt: -1 }).limit(4);

        // 2. Lấy 4 sản phẩm bán chạy nhất (sắp xếp theo sold giảm dần)
        const bestSellers = await Product.find().sort({ sold: -1 }).limit(4);

        // 3. Lấy 4 sản phẩm khuyến mãi
        // (Nếu Database bạn chưa có trường discount, mình tạm thời lấy sản phẩm có giá thấp nhất hoặc bạn có thể đổi logic sau)
        const promotions = await Product.find({ /* discount: { $gt: 0 } */ }).sort({ price: 1 }).limit(4);

        return res.status(200).json({
            success: true,
            data: {
                latest,
                bestSellers,
                promotions
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi Server", error: error.message });
    }
};

// Hàm tạo dữ liệu tự động
export const seedProducts = async (req, res) => {
    try {
        const mockProducts = [
            {
                "name": "Overture Automatique",
                "description": "Mang trong mình bộ máy cơ tự động tinh xảo...",
                "price": 462500000,
                "category": "Nam",
                "countInStock": 12,
                "sold": 150,
                "images": [
                    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1999&auto=format&fit=crop"
                ]
            },
        ];

        await Product.deleteMany({});
        const createdProducts = await Product.insertMany(mockProducts);
        res.status(201).json({ message: "Seed data thành công!", createdProducts });
    } catch (error) {
        res.status(500).json({ message: "Lỗi seed data", error: error.message });
    }
};

export const getProductsLazyLoad = async (req, res) => {
    try {
        // Nhận vào category, số trang (page) và số lượng phần tử mỗi lần load (limit)
        const { category, page = 1, limit = 4 } = req.query;

        let query = {};
        if (category) {
            query.category = category;
        }

        // Tính số lượng bản ghi cần bỏ qua
        const skipDocs = (Number(page) - 1) * Number(limit);

        // Lấy sản phẩm của trang hiện tại
        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skipDocs)
            .limit(Number(limit));

        // Tính tổng số lượng sản phẩm khớp điều kiện để FE biết khi nào hết dữ liệu
        const totalProducts = await Product.countDocuments(query);
        const hasMore = skipDocs + products.length < totalProducts;

        return res.status(200).json({
            success: true,
            products,
            hasMore // Trả về true/false để FE biết có cần load tiếp không
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi tải phân trang", error: error.message });
    }
};

export const getTopHighlights = async (req, res) => {
    try {
        // Lấy 10 sản phẩm có số lượng 'sold' lớn nhất
        const topSold = await Product.find().sort({ sold: -1 }).limit(10);

        // Lấy 10 sản phẩm có số lượng 'views' lớn nhất
        const topViews = await Product.find().sort({ views: -1 }).limit(10);

        return res.status(200).json({
            success: true,
            data: {
                topSold,
                topViews
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi lấy dữ liệu nổi bật", error: error.message });
    }
};