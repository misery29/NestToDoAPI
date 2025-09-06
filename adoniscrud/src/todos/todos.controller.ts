import { Controller, Post, Body, UseGuards, Req, Get, Param, Put, Delete } from '@nestjs/common';
import { TodosService } from './todos.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private svc: TodosService) {}

  @Post()
  create(@Req() req, @Body() body: { title: string }) {
    return this.svc.create(body.title, req.userId);
  }

  @Get()
  findAll(@Req() req) {
    return this.svc.findAll(req.userId);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id:string) {
    return this.svc.findOne(id, req.userId);
  }

  @Put(':id')
  update(@Req() req, @Param('id') id:string, @Body() body: any) {
    return this.svc.update(id, req.userId, body);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id:string) {
    return this.svc.remove(id, req.userId);
  }
}