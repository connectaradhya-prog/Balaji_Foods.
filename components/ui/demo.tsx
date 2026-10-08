import React from 'react'
import { FeatureSteps } from './feature-section'

const balajiFeatures = [
  { 
    step: '1978 — Generation I', 
    title: 'Secret Family Recipes & Pure Ghee',
    content: 'Our journey began in 1978 in a traditional Maharashtrian family kitchen. Crafted exclusively with 100% pure A2 Gir cow ghee, organic gram flour, and secret spice blends perfected over generations.', 
    image: 'balaji_story_heritage.png' 
  },
  { 
    step: '1998 — Generation II',
    title: 'Heavy Copper Kadai Roasting Ritual',
    content: 'We preserved authentic slow copper roasting techniques. Besan, poha, and dry fruits are roasted over controlled wood flames to yield irresistible aroma, flaky crunch, and golden perfection.',
    image: 'balaji_ladoo_hero.png'
  },
  { 
    step: '2026 — Modern Era',
    title: 'Royal Silk Hampers & Express Shipping',
    content: 'Blending heritage flavours with nitrogen-sealed 45-day freshness packaging, silk festival hampers, and express doorstep delivery across India and worldwide.',
    image: 'gift_box_new.png'
  },
]

export function FeatureStepsDemo() {
  return (
    <FeatureSteps 
      features={balajiFeatures}
      title="The Heritage of Taste & Purity"
      autoPlayInterval={4000}
      imageHeight="h-[420px]"
    />
  )
}
