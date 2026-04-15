import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import type { GetEntriesResponse, GetEntryResponse } from '@basebook/contracts';
import { CreateEntryDto } from './dto/create-entry.dto';
import { GetEntriesQueryDto } from './dto/get-entries-query.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { EntriesService } from './entries.service';

@Controller('entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Get()
  getEntries(@Query() query: GetEntriesQueryDto): Promise<GetEntriesResponse> {
    return this.entriesService.getEntries(query);
  }

  @Get(':id')
  getEntry(@Param('id') id: string): Promise<GetEntryResponse> {
    return this.entriesService.getEntry(id);
  }

  @Post()
  createEntry(@Body() body: CreateEntryDto): Promise<GetEntryResponse> {
    return this.entriesService.createEntry(body);
  }

  @Patch(':id')
  updateEntry(
    @Param('id') id: string,
    @Body() body: UpdateEntryDto,
  ): Promise<GetEntryResponse> {
    return this.entriesService.updateEntry(id, body);
  }

  @Delete(':id')
  deleteEntry(@Param('id') id: string): Promise<GetEntryResponse> {
    return this.entriesService.deleteEntry(id);
  }
}
