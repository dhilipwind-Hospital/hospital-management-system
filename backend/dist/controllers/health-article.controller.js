"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthArticleController = void 0;
const database_1 = require("../config/database");
const HealthArticle_1 = require("../models/HealthArticle");
const User_1 = require("../models/User");
class HealthArticleController {
}
exports.HealthArticleController = HealthArticleController;
_a = HealthArticleController;
// Create article
HealthArticleController.createArticle = async (req, res) => {
    var _b;
    try {
        const authorId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const { title, summary, content, category, tags, imageUrl, isPublished } = req.body;
        if (!title || !summary || !content || !category) {
            return res.status(400).json({ message: 'Required fields missing' });
        }
        const articleRepo = database_1.AppDataSource.getRepository(HealthArticle_1.HealthArticle);
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const author = await userRepo.findOne({ where: { id: authorId } });
        if (!author) {
            return res.status(404).json({ message: 'Author not found' });
        }
        const article = articleRepo.create({
            title,
            summary,
            content,
            category,
            tags: tags || [],
            imageUrl,
            isPublished: isPublished !== false,
            author
        });
        await articleRepo.save(article);
        return res.status(201).json({
            message: 'Article created successfully',
            data: article
        });
    }
    catch (error) {
        console.error('Error creating article:', error);
        return res.status(500).json({ message: 'Error creating article' });
    }
};
// Get all articles
HealthArticleController.getArticles = async (req, res) => {
    try {
        const { category, tag, isPublished = 'true' } = req.query;
        const articleRepo = database_1.AppDataSource.getRepository(HealthArticle_1.HealthArticle);
        const queryBuilder = articleRepo.createQueryBuilder('article')
            .leftJoinAndSelect('article.author', 'author')
            .orderBy('article.createdAt', 'DESC');
        if (isPublished === 'true') {
            queryBuilder.andWhere('article.isPublished = true');
        }
        if (category) {
            queryBuilder.andWhere('article.category = :category', { category });
        }
        if (tag) {
            queryBuilder.andWhere(':tag = ANY(article.tags)', { tag });
        }
        const articles = await queryBuilder.getMany();
        return res.json({
            data: articles,
            total: articles.length
        });
    }
    catch (error) {
        console.error('Error fetching articles:', error);
        return res.status(500).json({ message: 'Error fetching articles' });
    }
};
// Get article by ID
HealthArticleController.getArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const articleRepo = database_1.AppDataSource.getRepository(HealthArticle_1.HealthArticle);
        const article = await articleRepo.findOne({
            where: { id },
            relations: ['author']
        });
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        // Increment view count
        article.viewCount += 1;
        await articleRepo.save(article);
        return res.json({ data: article });
    }
    catch (error) {
        console.error('Error fetching article:', error);
        return res.status(500).json({ message: 'Error fetching article' });
    }
};
// Update article
HealthArticleController.updateArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const articleRepo = database_1.AppDataSource.getRepository(HealthArticle_1.HealthArticle);
        const article = await articleRepo.findOne({ where: { id } });
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        Object.assign(article, updateData);
        await articleRepo.save(article);
        return res.json({
            message: 'Article updated successfully',
            data: article
        });
    }
    catch (error) {
        console.error('Error updating article:', error);
        return res.status(500).json({ message: 'Error updating article' });
    }
};
// Delete article
HealthArticleController.deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const articleRepo = database_1.AppDataSource.getRepository(HealthArticle_1.HealthArticle);
        const article = await articleRepo.findOne({ where: { id } });
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        await articleRepo.remove(article);
        return res.json({ message: 'Article deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting article:', error);
        return res.status(500).json({ message: 'Error deleting article' });
    }
};
// Get categories
HealthArticleController.getCategories = async (req, res) => {
    try {
        const categories = Object.values(HealthArticle_1.ArticleCategory);
        return res.json({ data: categories });
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        return res.status(500).json({ message: 'Error fetching categories' });
    }
};
