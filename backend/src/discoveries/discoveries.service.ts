import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Discovery, DiscoveryDocument } from './discovery.schema';
import { QueryDiscoveriesDto } from './dto/query-discoveries.dto';
import { SEED_DISCOVERIES } from './seed-data';

@Injectable()
export class DiscoveriesService implements OnModuleInit {
  constructor(
    @InjectModel(Discovery.name)
    private readonly discoveryModel: Model<DiscoveryDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seed();
  }

  private async seed(): Promise<void> {
    const count = await this.discoveryModel.countDocuments().lean();
    if (count === 0) {
      await this.discoveryModel.insertMany(SEED_DISCOVERIES);
    }
  }

  async findAll(
    query: QueryDiscoveriesDto,
  ): Promise<{ data: DiscoveryDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.category && query.category !== 'All') {
      filter.category = query.category;
    }

    if (query.search && query.search.trim() !== '') {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ title: regex }, { organization: regex }];
    }

    const [data, total] = await Promise.all([
      this.discoveryModel
        .find(filter)
        .sort({ date: -1 })
        .lean<DiscoveryDocument[]>(),
      this.discoveryModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  async findBySlug(slug: string): Promise<DiscoveryDocument> {
    const discovery = await this.discoveryModel
      .findOne({ slug })
      .lean<DiscoveryDocument>();

    if (!discovery) {
      throw new NotFoundException(`Discovery with slug "${slug}" not found`);
    }

    return discovery;
  }
}
