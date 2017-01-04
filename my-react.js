

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
}

function mountVText(vText, parentDOMNode) {
	parentDOMNode.textContent = vText;
}

function mount(input, parentDOMNode) {
	if(typeof input === 'string' || typeof input === 'number') {
		mountVText(input, parentDOMNode);
	} else {
		mountVElement(input, parentDOMNode);
	}
}



//------------------- test app
(function testApp() {
	const parent = document.querySelector('#app');
	const app = createVElement('div', {className: 'my-class', style: {backgroundColor: 'green', height: '100px'}}, [
		createVElement('h2', {className: 'my-h2', style: {color: 'black'}}, 'react header'),
		createVElement('p', {className: 'my-p'}, 'react paragraph'),
		]);
	mountVElement(app, parent);

	// app.dom.style = 'background-color: red';
	console.log(app.dom);
})();

