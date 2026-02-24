import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { Student } from './Student';

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 200, nullable: false })
  name!: string;

  @Column({ name: 'professor_id', type: 'uuid' })
  professorId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;

  @ManyToOne(() => User, user => user.classesTaught)
  @JoinColumn({ name: 'professor_id' })
  professor!: User;

  @OneToMany(() => Student, student => student.class, { eager: false })
  students!: Student[];
}

