import { Handler } from 'express'

export * from './is-authenticated'
export * from './is-owner'

export interface MiddlewaresCollection {
  isAuthenticated: Handler,
  isOwner: (prop: string, ownerKey?: string) => Handler,
}
