'use strict'

const React = require('react')
const PropTypes = require('prop-types')
const numericPattern = require('numeric-pattern')

const callAll = (...fns) => arg => fns.forEach(fn => fn && fn(arg))

module.exports = exports.default = class StepperPrimitive extends React.Component {
  static propTypes = {
    defaultValue: PropTypes.number,
    value: PropTypes.number,
    step: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number,
    onChange: PropTypes.func,
    render: PropTypes.func.isRequired,
    enableReinitialize: PropTypes.bool
  }

  static defaultProps = {
    defaultValue: 0,
    step: 1,
    min: -Number.MAX_VALUE,
    max: Number.MAX_VALUE,
    onChange: () => {},
    enableReinitialize: false
  }

  state = {
    value: this.getValue({value: this.props.defaultValue})
  }

  componentDidUpdate (prevProps, prevState) {
    if (
      this.props.enableReinitialize &&
      prevProps.defaultValue !== this.props.defaultValue &&
      prevProps.defaultValue === prevState.value
    ) {
      this.setValue(this.props.defaultValue)
    }
  }

  isControlled () {
    return this.props.value !== undefined
  }

  getValue (state = this.state) {
    return this.isControlled() ? this.props.value : state.value
  }

  setValue = (value) => {
    value = Math.min(this.props.max, Math.max(value, this.props.min))
    if (this.isControlled()) {
      this.props.onChange(value)
    } else {
      this.setState({value}, () => this.props.onChange(this.getValue()))
    }
  }

  increment = () => {
    this.setValue(this.getValue() + this.props.step)
  }

  decrement = () => {
    this.setValue(this.getValue() - this.props.step)
  }

  handleSubmit = ev => {
    ev.preventDefault()
    if (this.input) this.input.blur()
  }

  handleInputRef = node => {
    if (!node) return
    this.input = node
  }

  handleBlur = () => {
    if (!this.input) return
    this.input.blur()
    this.setState({ focused: false })

    let value = parseFloat(this.input.value)
    if (isNaN(value) || value === this.getValue()) return

    this.setValue(value)
  }

  handleFocus = () => {
    if (!this.input) return
    this.setState({ focused: true }, () => {
      this.input.value = this.getValue()
      this.input.setSelectionRange(0, 9999)
    })
  }

  getFormProps = (props = {}) => {
    return {
      onSubmit: this.handleSubmit
    }
  }

  getIncrementProps = (props = {}) => {
    return {
      onClick: callAll(props.onClick, this.increment)
    }
  }

  getDecrementProps = (props = {}) => {
    return {
      onClick: callAll(props.onClick, this.decrement)
    }
  }

  getInputProps = (props = {}) => {
    return {
      type: 'text',
      ref: callAll(props.ref, this.handleInputRef),
      pattern: numericPattern,
      onBlur: callAll(props.onBlur, this.handleBlur),
      onFocus: callAll(props.onFocus, this.handleFocus),
      focused: this.state.focused,
      // When the input is focused, let the user type freely.
      // When the input isn't, lock it to the current value
      ...this.state.focused ? {} : {
        value: this.getValue()
      }
    }
  }

  render () {
    return this.props.render({
      value: this.getValue(),
      focused: this.state.focused,
      increment: this.increment,
      decrement: this.decrement,
      setValue: this.setValue,
      getFormProps: this.getFormProps,
      getInputProps: this.getInputProps,
      getIncrementProps: this.getIncrementProps,
      getDecrementProps: this.getDecrementProps
    })
  }
}
