import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TodoDoc } from './todos.schema';

@Injectable()
export class TodosService {
  constructor(@InjectModel('Todo') private todoModel: Model<TodoDoc>) {}

  async create(title:string, ownerId:string){
    return this.todoModel.create({ title, owner: ownerId });
  }

  async findAll(ownerId:string){
    return this.todoModel.find({ owner: ownerId });
  }

  async findOne(id:string, ownerId:string){
    const todo = await this.todoModel.findById(id);
    if (!todo) throw new NotFoundException();
    if (todo.owner.toString() !== ownerId) throw new ForbiddenException();
    return todo;
  }

  async update(id:string, ownerId:string, data: Partial<{title:string,done:boolean}>){
    const todo = await this.todoModel.findById(id);
    if (!todo) throw new NotFoundException();
    if (todo.owner.toString() !== ownerId) throw new ForbiddenException();
    Object.assign(todo, data);
    return todo.save();
  }

  async remove(id:string, ownerId:string){
    const todo = await this.todoModel.findById(id);
    if (!todo) throw new NotFoundException();
    if (todo.owner.toString() !== ownerId) throw new ForbiddenException();
    return this.todoModel.findByIdAndDelete(id);
  }
}