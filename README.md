# game-of-life
Extremely fast GPU accelerated game of life React component!

Project inspired by [xpl/expression](https://github.com/xpl/expression)

![image](https://user-images.githubusercontent.com/10416254/111778078-6c748b00-88b4-11eb-8fb4-c7e899ee636a.gif)

```typescript
<Canvas
  width={renderingWidth}
  height={renderingHeight}
  config={{
    width: mapSize,
    height: mapSize
  }}
  running={true}
  rules={[Rule.Die, Rule.Die, Rule.Keep, Rule.Spawn, Rule.Die, Rule.Die, Rule.Die, Rule.Keep, Rule.Die]}
  hue={hue}
/>
```
