import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Folder from '../src/components/Folder.vue'

describe('Folder.vue Component', () => {
  it('renders footer with current year', () => {
    const wrapper = mount(Folder)
    const currentYear = new Date().getFullYear()
    
    expect(wrapper.text()).toContain(currentYear.toString())
    expect(wrapper.text()).toContain('StarCodeKh')
  })

  it('has correct link attributes', () => {
    const wrapper = mount(Folder)
    const link = wrapper.find('.footer-link')
    
    expect(link.attributes('href')).toBe('https://souysoeng.com')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener')
  })

  it('applies correct CSS classes', () => {
    const wrapper = mount(Folder)
    
    expect(wrapper.find('.footer').exists()).toBe(true)
    expect(wrapper.find('.footer-content').exists()).toBe(true)
    expect(wrapper.find('.footer-link').exists()).toBe(true)
  })
})
