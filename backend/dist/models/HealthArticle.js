"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthArticle = exports.ArticleCategory = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
var ArticleCategory;
(function (ArticleCategory) {
    ArticleCategory["GENERAL_HEALTH"] = "general_health";
    ArticleCategory["NUTRITION"] = "nutrition";
    ArticleCategory["EXERCISE"] = "exercise";
    ArticleCategory["MENTAL_HEALTH"] = "mental_health";
    ArticleCategory["CHRONIC_DISEASE"] = "chronic_disease";
    ArticleCategory["PREVENTIVE_CARE"] = "preventive_care";
    ArticleCategory["WOMENS_HEALTH"] = "womens_health";
    ArticleCategory["MENS_HEALTH"] = "mens_health";
    ArticleCategory["PEDIATRICS"] = "pediatrics";
    ArticleCategory["SENIOR_CARE"] = "senior_care";
})(ArticleCategory = exports.ArticleCategory || (exports.ArticleCategory = {}));
let HealthArticle = class HealthArticle {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], HealthArticle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], HealthArticle.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], HealthArticle.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], HealthArticle.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ArticleCategory
    }),
    __metadata("design:type", String)
], HealthArticle.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], HealthArticle.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], HealthArticle.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], HealthArticle.prototype, "isPublished", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], HealthArticle.prototype, "viewCount", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'author_id' }),
    __metadata("design:type", User_1.User)
], HealthArticle.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], HealthArticle.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], HealthArticle.prototype, "updatedAt", void 0);
HealthArticle = __decorate([
    (0, typeorm_1.Entity)({ name: 'health_articles' })
], HealthArticle);
exports.HealthArticle = HealthArticle;
