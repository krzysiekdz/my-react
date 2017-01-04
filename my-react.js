

function createVElement(tag, config, children = null) {
	const {className} = config;

	return {
		tag: tag, 
		className,
		dom: null,
		props: {
			children,
		},
	};
}

function mountVElement(vElement, parentDOMNode) {
	const {tag, className, props} = vElement;
	const domNode = document.createElement(tag);
	vElement.dom = domNode;
	if(className !== undefined) {
		domNode.className = className;
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
	const app = createVElement('div', {className: 'my-class'}, [
		createVElement('h2', {className: 'my-h2'}),
		createVElement('p', {className: 'my-p'}),
		]);
	mountVElement(app, parent);
})();

