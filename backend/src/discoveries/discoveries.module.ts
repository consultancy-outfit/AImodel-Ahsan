import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Discovery, DiscoverySchema } from './discovery.schema';
import { DiscoveriesController } from './discoveries.controller';
import { DiscoveriesService } from './discoveries.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Discovery.name, schema: DiscoverySchema },
    ]),
  ],
  controllers: [DiscoveriesController],
  providers: [DiscoveriesService],
  exports: [DiscoveriesService],
})
export class DiscoveriesModule {}
