

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
		props.children.forEach(function(child) {
			mountVElement(child, domNode);
		});
	}
	parentDOMNode.appendChild(domNode);
}



//------------------- test app
(function testApp() {
	const parent = document.querySelector('#app');
	const app = createVElement('div', {className: 'my-class', style: {backgroundColor: 'green', height: '100px'}}, [
		createVElement('h2', {className: 'my-h2', style: {color: 'black'}}),
		createVElement('p', {className: 'my-p'}),
		]);
	mountVElement(app, parent);

	// app.dom.style = 'background-color: red';
	console.log(app.dom);
})();

