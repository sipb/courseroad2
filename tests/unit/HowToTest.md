# How to Write Vue Unit Tests

## Basic Test Setup

To create a test for a new component, create a [component name].spec.js file under tests/unit/. There, you will import that component and create test functions for it. If you add functionality to an existing component that has a test file already, you should add test functions to it. The basic paradigm of unit testing in Vue is to "describe" a component by saying what "it" does. Within those tests, you "expect" certain things to be true.

For example:

```javascript
import { shallowMount } from "@vue/test-utils";
import HelloWorld from "../../src/components/HelloWorld.vue";

describe("HelloWorld", () => {
  // Now mount the component and you have the wrapper
  it("renders props.msg when passed", () => {
    const msg = "new message";
    const wrapper = shallowMount(HelloWorld, {
      propsData: { msg },
    });
    expect(wrapper.text()).toMatch(msg);
  });

  // it's also easy to check for the existence of elements
  it("has a button", () => {
    const wrapper = shallowMount(HelloWorld);
    expect(wrapper.contains("button")).toBe(true);
  });
});
```

The message after 'it' should be a description of what you are testing for.

## Resources

This will cover a few common things you might want to do in testing, but [this website](https://vue-test-utils.vuejs.org/) will have details and examples for much more. [This](https://itnext.io/testing-with-jest-and-vue-js-pocket-guide-7be290d20954) is also a nice guide.

## Mount vs Shallow Mount

Vue Test Utils contains two functions, mount and shallowMount. shallowMount will not mount any of the sub-components, so that you can test only the core functionality. This will usually not work well with our code, since we use vuetify components everywhere and they will not be loaded on shallowMount. Unfortunately, this means that shallowMount can be used for very little and in general I would recommend using mount for this project.

To create a [wrapper](https://vue-test-utils.vuejs.org/api/wrapper/) test object, you should use the mount function: `mount(ComponentName, options)`.

## Using Vuetify

You normally create a local Vue instance for testing, separate from the one used in the main page, and apply anything you need to use to it.

For example, if you needed to use Vuex, you would write:

```javascript
const localVue = createLocalVue();
localVue.use(Vuex);
```

Vuetify dislikes this very much. Instead, just use it on the global Vue again.

```javascript
Vue.use(Vuetify);
```

## Using Vuex/The Store

You might want to test functions of your component that depend on values in the store. You can set up a mock store to use in your test. It will simply be a dictionary object of the properties and values. Then, pass it in as the store property to the second argument to mount or shallow mount. If you want to use the same store for all of your tests, you can utilize the beforeEach function of describe.

```javascript
describe('HelloWorld', () => {
  let store;

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        prop1: 'hi',
        prop2: 'hello',
        prop3: 'goodbye'
      }
    });
  });
  it('does 1 thing', () => {
    ...
  });
  it('does another thing', () => {
    ...
  });
  ...
});
```

## Testing Component Methods and Property Values

The wrapper object produced by mounting the component has a property `vm` that is the Vue instance. It will contain functions and properties on the component. To call a function on the component, use `wrapper.vm.functionName()`. To get properties, use `wrapper.vm.propertyName`. The `wrapper.vm` object contains a lot of other information as well. For example, the number of function calls is stored in `wrapper.vm.functionName.mock.calls.length`, and there's lots of other uses as well.

## Testing Component HTML

To test component html, you can use the `wrapper.find()` function to find specific html within a component. It works the same way as jquery find, so you can do things like `wrapper.find(#someComponentID)` or `wrapper.find('.someComponentClass')`. To find vuetify components, you can use their vuetify class names (ex: `wrapper.find('.v-btn')`).

Once you find a component, you can click on it (`component.trigger('click')`), or test if it has certain classes applied to it (`component.classes('myclass')`), contains a component or element (`component.contains('p')`), as well as anything else you can do to a [wrapper](https://vue-test-utils.vuejs.org/api/wrapper/).

## Expecting Certain Things to Happen

Once you isolate the values or functions you are looking for, you want to assert that they are equal to certain values. The basic way to do this is `expect(value i'm testing).someFunction()`. The options for someFunction are varied - you can expect something to `.toBe(another value)`, or `.toBeTruthy()`, or `.toBeCloseTo(some number, precision)`, among other things. [Here's](https://jestjs.io/docs/en/expect) a full list of the possibilities.

This guide isn't exhaustive but it should be enough to get you started. Refer to above resources if you want to do something not listed here - it's a giant API and chances are, there's a property or function somewhere that can help you.
