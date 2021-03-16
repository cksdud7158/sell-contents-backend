import { InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Entity } from 'typeorm';

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Contents extends CoreEntity {}
