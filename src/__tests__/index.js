const React = require('react')
const {mount} = require('enzyme')
const Stepper = require('../')

function setup ({render = () => <div />, ...props} = {}) {
  let renderArg
  const renderSpy = jest.fn(arg => {
    renderArg = arg
    return render(arg)
  })
  const wrapper = mount(<Stepper {...props} render={renderSpy} />)
  return {renderSpy, wrapper, ...renderArg}
}

test('value defaults to 0', () => {
  const {value} = setup()
  expect(value).toBe(0)
})

test('value follows defaultValue', () => {
  const {value} = setup({defaultValue: 33})
  expect(value).toBe(33)
})

test('getFormProps', () => {
  const {getFormProps} = setup({})
  expect(getFormProps()).toMatchSnapshot()
})

test('getInputProps', () => {
  const {wrapper, getInputProps} = setup({})
  expect(getInputProps().value).toBe(0)
  expect(getInputProps()).toMatchSnapshot()
  wrapper.setState({ focused: true })
  expect(getInputProps().value).toBe(undefined)
  expect(getInputProps()).toMatchSnapshot()
})

test('getIncrementProps', () => {
  const {getIncrementProps} = setup()
  expect(getIncrementProps()).toMatchSnapshot()
})

test('getDecrementProps', () => {
  const {getDecrementProps} = setup()
  expect(getDecrementProps()).toMatchSnapshot()
})

test('setValue is between [min, max]', () => {
  const {wrapper, setValue} = setup({min: 0, max: 1})

  setValue(2)
  expect(wrapper.state('value')).toBe(1)
  setValue(-1)
  expect(wrapper.state('value')).toBe(0)
  setValue(1)
  expect(wrapper.state('value')).toBe(1)
  setValue(0)
  expect(wrapper.state('value')).toBe(0)
})

test('increment/decrement are capped at min/max', () => {
  const {wrapper, increment, decrement} = setup({min: 0, max: 1})

  expect(wrapper.state('value')).toBe(0)
  increment()
  expect(wrapper.state('value')).toBe(1)
  increment()
  expect(wrapper.state('value')).toBe(1)
  decrement()
  expect(wrapper.state('value')).toBe(0)
  decrement()
  expect(wrapper.state('value')).toBe(0)
})

describe('enableReinitialize', () => {
  test('true: value is updated to new default if defaultValue changes and value has not been modified', () => {
    const {wrapper} = setup({defaultValue: 33, enableReinitialize: true})

    expect(wrapper.state('value')).toBe(33)
    wrapper.setProps({defaultValue: 42})
    expect(wrapper.state('value')).toBe(42)
  })

  test('true: value is not updated to new default if defaultValue changes and value has been modified', () => {
    const {wrapper} = setup({defaultValue: 33, enableReinitialize: true})

    expect(wrapper.state('value')).toBe(33)
    wrapper.setState({value: 418})
    wrapper.setProps({defaultValue: 42})
    expect(wrapper.state('value')).toBe(418)
  })

  test('false: value remains unchanged if defaultValue changes', () => {
    const {wrapper} = setup({defaultValue: 33})

    expect(wrapper.state('value')).toBe(33)
    wrapper.setProps({defaultValue: 42})
    expect(wrapper.state('value')).toBe(33)
  })
})
