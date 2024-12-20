// Layout config and defaults

export const DEFAULT_LAYOUT = 'basic'

export const layouts = {
	// basic layout (default)
	basic: {
		name: 'Basic',
		thumbnail: '',
		options: {
			colour_button1: {
				name: "Button 1 colour",
				type: "colour",
			},
			colour_button2: {
				name: "Button 2 colour",
				type: "colour",
			},
			colour_button3: {
				name: "Button 3 colour",
				type: "colour",
			},
			colour_button4: {
				name: "Button 4 colour",
				type: "colour",
			},
			colour_background: {
				name: "Background colour",
				type: "colour",
			}
		}
	}
}


/*

Types can be:

colour - a colour, obviously (bring up a picker - make sure transparency is available too)
font - a simple choice between a few fonts? (Check with Ryan)
[Object] - a way of choosing more complex bits of css:
	{
		"css_var_name" : {
			"css_var_value": "human readable description",
			"10px 20px 30px 20px": "Margin style 1"
		}
	}

*/