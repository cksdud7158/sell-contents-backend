import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';
import { string } from 'joi';

export enum UserRole {
  NormalUser = 'NormalUser',
  Photo = 'Photo',
  Model = 'Model',
  Admin = 'Admin',
}

export enum SNS {
  instagram = 'instagram',
  facebook = 'facebook',
  youtube = 'youtube',
  twitter = 'twitter',
  ticktok = 'ticktok',
}

registerEnumType(UserRole, { name: 'UserRole' });
registerEnumType(SNS, { name: 'SNS' });

// SNS URL 타입
@InputType('SnsUrlsInputType', { isAbstract: true })
@ObjectType()
export class snsUrls {
  @Field((type) => String)
  snsName: string;

  @Field((type) => String)
  url: string;
}

// User Entity
@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column({ unique: true })
  @Field((type) => String)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Field((type) => String)
  @IsString()
  password: string;

  @Column()
  @Field((type) => String)
  @IsString()
  nickName: string;

  @Column({ type: 'simple-array', enum: UserRole })
  @Field((type) => UserRole)
  role: UserRole;

  @Column()
  @Field((type) => String)
  phoneNum: string;

  @Column({ type: 'json', nullable: true })
  @Field((type) => [snsUrls], { nullable: true })
  snsUrls?: snsUrls[];

  @Column({ nullable: true })
  @Field((type) => String, { nullable: true })
  profilePicture?: string;

  // 만약 외국인이면 가입시 자동으로 true로 되게하자
  @Column({ default: false })
  @Field((type) => Boolean)
  @IsBoolean()
  verified: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException();
      }
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  async deleteSpecialCharacters(): Promise<void> {
    if (this.phoneNum) {
      try {
        var specialCharactersFilter = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
        this.phoneNum = this.phoneNum.replace(specialCharactersFilter, '');
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(aPassword, this.password);
      return ok;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
