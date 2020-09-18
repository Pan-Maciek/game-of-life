import * as twgl from 'twgl.js'

export enum Rule { Die, Keep, Spawn }
export type Rules = [Rule, Rule, Rule, Rule, Rule, Rule, Rule, Rule, Rule]

export const defaultRules: Rules = [Rule.Die, Rule.Die, Rule.Keep, Rule.Spawn, Rule.Die, Rule.Die, Rule.Die, Rule.Die, Rule.Die]

export const createRuleTexture = (gl: WebGLRenderingContext, rules: Rules) => twgl.createTexture(gl, {
  width: 16, height: 1, // texture size must be 2^n
  mag: gl.NEAREST,
  min: gl.NEAREST,
  internalFormat: gl.RGB,
  format: gl.RGB,
  src: [
    ...rules.map(rule => {
      if (rule == Rule.Die) return [255, 0, 0]
      if (rule == Rule.Keep) return [0, 255, 0]
      if (rule == Rule.Spawn) return [0, 255, 255]
    }).flat(),
    ...Array.from({ length: 21 }, () => 0) // fill remaining colors
  ]
})