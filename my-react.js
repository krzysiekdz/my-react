

function createVElement(tag, config, children = null) {
	const {className, style} = config;

	return {
		tag,
		className,
		style,
		dom: null,
		props: {
			children,
		},
	};
}

function createVComponent(tag, props) {
	return {
		tag,
		props,
		dom: null,
	};
}

function createElement(tag, config, children) {
	if(typeof tag == 'function') {
		return createVComponent(tag, config);
	} else {
		return createVElement(tag, config, children);
	}
}

function mountVElement(vElement, parentDOMNode) {
	const {tag, className, style, props} = vElement;
	const domNode = document.createElement(tag);
	vElement.dom = domNode;
	if(className !== undefined) {
		domNode.className = className;
	}
	if(style !== undefined) {
		Object.keys(style).forEach(function(key) {
			domNode.style[key] = style[key];
		});
	}
	if(props.children) {
		if(props.children.length && typeof props.children !== 'string') {
			props.children.forEach(function(child) {
				mount(child, domNode);
			});
		} else {
			mount(props.children, domNode);
		}
		
	}
	parentDOMNode.appendChild(domNode);
	return domNode;
}

function mountVText(vText, parentDOMNode) {
	parentDOMNode.textContent = vText;
	return parentDOMNode;
}

//komponent ma metode render, wirtualny element nie ma render
function mountVComponent(vComponent, parentDOMNode) {
	const {tag, props} = vComponent;

	const Component = tag;
	const instance = new Component(props);

	console.log(instance);

	const nextRenderedElement = instance.render();
	instance._currentElement = nextRenderedElement;
	instance._parentNode = parentDOMNode;

	const dom = mount(nextRenderedElement, parentDOMNode);
	vComponent._instance = instance;
	vComponent.dom = dom;

	parentDOMNode.appendChild(dom);
	return dom;
}	

function mount(input, parentDOMNode) {
	// console.log(input);
	if(typeof input === 'string' || typeof input === 'number') {
		return mountVText(input, parentDOMNode);
	} else if (typeof input.tag === 'function'){
		return mountVComponent(input, parentDOMNode);
	} else if (typeof input.tag === 'string') {
		return mountVElement(input, parentDOMNode);
	}
}

class Component {
	constructor(props) {
		this.props = props || {};
		this.state = {};

		this._pendingState = null;
		this._currentElement = null;
		this._parentNode = null;
	}

	updateComponent() {
		const prevState = this.state;
		const prevElement = this._currentElement;

		if(this._pendingState !== prevState) {
			this.state = this._pendingState;
		}
		this._pendingState = null;
		const nextRenderedElement = this.render();
		this._currentElement = nextRenderedElement;

		mount(nextRenderedElement, this._parentNode);
	}

	setState(partialNewState) {
		this._pendingState = Object.assign({}, this.state, partialNewState);
		this.updateComponent();
	}

	//will be overridden
	render() {}
}



//------------------- test app


//komponent tworzy po prostu za pomoca render, elementy i przyczepia je w dom;
//chodzi o to, ze umozliwa on juz dynamiczne działanie strony
class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			ctr : 1,
		};

		// setInterval(() => {
		// 	this.setState({ctr: this.state.ctr +1});
		// }, 2000);
	} 

	render() {
		const message = this.props.message;
		return createElement('div', {style: {backgroundColor: 'blue', height: '100px'}}, 
			[
				createElement('h1', {}, message),
				createElement('p', {}, this.state.ctr),
			]
			);
	}
}

(function testApp() {
	const parent = document.querySelector('#app');
	// const app = createVElement('div', {className: 'my-class', style: {backgroundColor: 'green', height: '100px'}}, [
	// 	createVElement('h2', {className: 'my-h2', style: {color: 'black'}}, 'react header'),
	// 	createVElement('p', {className: 'my-p'}, 'react paragraph'),
	// 	]);
	// mountVElement(app, parent);

	// app.dom.style = 'background-color: red';
	// console.log(app.dom);

	mount( createElement(App, {message: 'hello world!'}) ,   parent);
})();



