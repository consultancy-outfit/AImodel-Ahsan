import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model as MongooseModel } from 'mongoose';
import { AIModel, ModelDocument } from './model.schema';
import { QueryModelsDto } from './dto/query-models.dto';
import { SEED_MODELS } from './seed-data';

@Injectable()
export class ModelsService implements OnModuleInit {
  constructor(
    @InjectModel('Model') private modelModel: MongooseModel<ModelDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seed();
  }

  async findAll(query: QueryModelsDto): Promise<ModelDocument[]> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter['$or'] = [
        { name: regex },
        { lab: regex },
        { description: regex },
      ];
    }

    if (query.category && query.category !== 'All') {
      filter['category'] = query.category;
    }

    if (query.labs) {
      const labList = query.labs
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);
      if (labList.length > 0) {
        filter['lab'] = { $in: labList };
      }
    }

    if (query.maxPrice !== undefined && query.maxPrice < 100) {
      filter['inputPrice'] = { $lte: query.maxPrice };
    }

    if (query.minRating !== undefined && query.minRating > 0) {
      filter['rating'] = { $gte: query.minRating };
    }

    let sortOption: Record<string, 1 | -1> = { rating: -1 };
    switch (query.sortBy) {
      case 'price-asc':
        sortOption = { inputPrice: 1 };
        break;
      case 'price-desc':
        sortOption = { inputPrice: -1 };
        break;
      case 'name':
        sortOption = { name: 1 };
        break;
      case 'rating':
      default:
        sortOption = { rating: -1 };
        break;
    }

    return this.modelModel
      .find(filter)
      .sort(sortOption)
      .lean() as unknown as ModelDocument[];
  }

  async seed(): Promise<void> {
    const count = await this.modelModel.countDocuments();
    if (count > 0) {
      return;
    }
    await this.modelModel.insertMany(SEED_MODELS);
  }
}
