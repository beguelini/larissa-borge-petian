import { describe, expect, it } from 'vitest'
import { totalPlanCents } from './consultation-clinic'

describe('totalPlanCents', () => {
  it('calcula planos com desconto sem erro de arredondamento', () => {
    expect(totalPlanCents(20000, 1, 0)).toBe(20000)
    expect(totalPlanCents(20000, 3, 10)).toBe(54000)
    expect(totalPlanCents(19999, 6, 12.5)).toBe(104995)
  })
})
