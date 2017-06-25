

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

	// console.log(instance);

	const nextRenderedElement = instance.render();
	instance._currentElement = nextRenderedElement;
	// console.log(nextRenderedElement);
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

function update(prevElement, nextElement) {
	if(prevElement.tag === nextElement.tag) {
		if(typeof prevElement.tag === 'string') {
			updateVElement(prevElement, nextElement);
		} else if (typeof prevElement.tag === 'function') { //brakuje rozwiązania dla sytuacji gdy update-ujemy komponent, if wyzej updateuje jedynie wirtualny element
			updateVComponent(prevElement, nextElement);
		}
	}  else {
	}
}

function updateVElement(prevElement, nextElement) {
	const dom = prevElement.dom;
	nextElement.dom = dom;

	const nextStyle = nextElement.style;
	if(prevElement.style !== nextStyle) {//if styles are diffrent, modifies the DOM
		Object.keys(nextStyle).forEach(prop => {
			dom.style[prop] = nextStyle[prop];
		});
	}

	if(nextElement.props.children) {
		updateChildren(prevElement.props.children, nextElement.props.children, dom);
	}

}

//porównanie komponentow wirtualnych
function updateVComponent(prevVComponent, nextVComponent) {
	const {_instance} = prevVComponent;
	nextVComponent._instance = _instance;
	nextVComponent.dom =  prevVComponent.dom;
	
	if(prevVComponent.props !== nextVComponent.props ) {//jesli propsy dla komponentu sie różnia, to nalezy zakutalizowac komponent faktyczy
		_instance.props = nextVComponent.props;//przekazanie nowego zestawu propsow do komponentu faktycznego
		// nextVComponent._instance.updateComponent();
		if(_instance.shouldComponentUpdate()) {
			const prevElement = _instance._currentElement;
			const nextElement = _instance.render();//instance musi miec aktualne propsy -> pierwsza linia w if'ie; w tym momencie utworzone zostaje jedynie aktualne wirtualne drzewo
			_instance._currentElement = nextElement;
			update(prevElement, nextElement);//dopiero poprzez tą funkcję następują aktulalizacje elementow - musimy porownac 2 wirtualne drzewa i tam gdzie się różnią, tam aktualizujemy DOM, ktory jest podpiety do wirtualnych elementow
		}
	}
}

function updateChildren(prevChildren, nextChildren, parentDOMNode) {
	if(!Array.isArray(nextChildren)) {
		nextChildren = [nextChildren];
	}
	if(!Array.isArray(prevChildren)) {
		prevChildren = [prevChildren];
	}

	for(let i = 0; i < nextChildren.length; i++) {
		const next = nextChildren[i];
		const prev = prevChildren[i];

		if((typeof next === 'string' && typeof prev === 'string')  || 
			(typeof next === 'number' && typeof prev === 'number')
			) {
			updateVText(prev, next, parentDOMNode);
		} else {
			update(prev, next);
		}
	}
}

function updateVText(prevText, nextText, parentDOMNode) {
	if(prevText !== nextText) {
		// parentDOMNode.firstChild.nodeValue = nextText;
		parentDOMNode.textContent = nextText;
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
		const nextElement = this.render();
		this._currentElement = nextElement;

		// mount(nextRenderedElement, this._parentNode);
		// console.log(prevElement, nextElement);
		update(prevElement, nextElement, this._parentNode);
	}

	setState(partialNewState) {
		this._pendingState = Object.assign({}, this.state, partialNewState);
		this.updateComponent();
	}

	shouldComponentUpdate() {
		return true;
	}



	//will be overridden
	render() {}
}



//------------------- test app


class Header extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return createElement(
				'h2', 
				{style: {color: 'red', height: (this.props.ctr + 20) + 'px'}},
				`the count is ${this.props.ctr}`);
	}

	shouldComponentUpdate() {
		return (this.props.ctr % 2) === 1;
	}
}

//komponent tworzy po prostu za pomoca render, elementy i przyczepia je w dom;
//chodzi o to, ze umozliwa on juz dynamiczne działanie strony
class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			ctr : 2,
		};

		setInterval(() => {
			this.setState({ctr: this.state.ctr +1});
		}, 2000);
	} 

	render() {
		const {message} = this.props;
		const {ctr} = this.state;
		return createElement('div', {style: {backgroundColor: 'blue', height:  + (100 + ctr) + 'px'}}, 
			[
				createElement('h1', {}, message),
				createElement('p', {}, ctr),
				createElement(Header, {ctr: ctr}),
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



