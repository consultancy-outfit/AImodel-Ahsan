import { Controller, Get, Param, Query } from '@nestjs/common';
import { DiscoveriesService } from './discoveries.service';
import { QueryDiscoveriesDto } from './dto/query-discoveries.dto';
import { DiscoveryDocument } from './discovery.schema';

@Controller('discoveries')
export class DiscoveriesController {
  constructor(private readonly discoveriesService: DiscoveriesService) {}

  @Get()
  async findAll(
    @Query() query: QueryDiscoveriesDto,
  ): Promise<{ data: DiscoveryDocument[]; total: number }> {
    return this.discoveriesService.findAll(query);
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string): Promise<DiscoveryDocument> {
    return this.discoveriesService.findBySlug(slug);
  }
}
