/**
 * Debugging data for development/testing
 */
APP.Debug = {

    enabled: false,

    // Enable debugging, if url is set to some variation of 'debug'
    enable: function (url) {
        var self = APP.Debug;

        if (typeof url == 'undefined') {
            if (self.enabled) {
                url = 'debug';
            } else {
                url = '';
            }
        }

        self.enabled = false;

        if (url.toLowerCase() == 'debug') {

            APP.log('DEBUG DATA ENABLED');

            self.enabled = true;

            APP.Config.url = url;
            chrome.storage.local.set({config: APP.Config});

            // APP.Data.data = Object.create(self.data);
        }

        return self.enabled;

    },

    // Debugging data to be used
    data: {
        "projects": [
            {
                "company": {
                    "id": 3773718,
                    "name": "Testco Incorporated"
                },
                "created-on": "2018-05-19",
                "id": 14203098,
                "last-changed-on": "2018-08-07T02:08:51Z",
                "name": "Test Project",
                "start-page": "todos",
                "url": "https://putnam1.basecamphq.com/projects/14203098"
            },
            {
                "company": {
                    "id": 3773718,
                    "name": "Alphabet Testers"
                },
                "created-on": "2018-05-19",
                "id": 10000000,
                "last-changed-on": "2018-08-07T02:08:51Z",
                "name": "Integration",
                "start-page": "todos",
                "url": "https://putnam1.basecamphq.com/projects/14203098"
            },
            {
                "company": {
                    "id": 3773718,
                    "name": "Testco Incorporated"
                },
                "created-on": "2018-05-19",
                "id": 20000000,
                "last-changed-on": "2018-08-07T02:08:51Z",
                "name": "_Old Project",
                "start-page": "todos",
                "url": "https://putnam1.basecamphq.com/projects/14203098"
            }
        ],
        "projects_created": 9999999999999,
        "project-todo-lists": {
            "20000000": {
                "project": [
                    {
                        "company": {
                            "id": 3773718,
                            "name": "Testco Incorporated"
                        },
                        "created-on": "2018-05-19",
                        "id": 20000000,
                        "last-changed-on": "2018-08-07T02:08:51Z",
                        "name": "_Old Project",
                        "start-page": "todos",
                        "url": "https://putnam1.basecamphq.com/projects/14203098"
                    }
                ],
                "lists": [
                    {
                        "id": 30026062,
                        "url": "https://putnam1.basecamphq.com/todo_lists/30026062",
                        "name": "Such an old list",
                        "description": "",
                        "position": 2,
                        "completed": false,
                        "uncompleted-count": 4,
                        "completed-count": 0
                    },
                    {
                        "id": 29928724,
                        "url": "https://putnam1.basecamphq.com/todo_lists/29928724",
                        "name": "Methusala",
                        "description": "",
                        "position": 3,
                        "completed": false,
                        "uncompleted-count": 3,
                        "completed-count": 0
                    }
,
                    {
                        "id": 29928724,
                        "url": "https://putnam1.basecamphq.com/todo_lists/29928724",
                        "name": "Even older list",
                        "description": "",
                        "position": 4,
                        "completed": false,
                        "uncompleted-count": 3,
                        "completed-count": 0
                    }
                ]
            },
            "10000000": {
                "project": [
                    {
                        "company": {
                            "id": 3773718,
                            "name": "Alphabet Testers"
                        },
                        "created-on": "2018-05-19",
                        "id": 10000000,
                        "last-changed-on": "2018-08-07T02:08:51Z",
                        "name": "Integration",
                        "start-page": "todos",
                        "url": "https://putnam1.basecamphq.com/projects/14203098"
                    }
                ],
                "lists": [
                    {
                        "id": 30026062,
                        "url": "https://putnam1.basecamphq.com/todo_lists/30026062",
                        "name": "Test Once",
                        "description": "",
                        "position": 2,
                        "completed": false,
                        "uncompleted-count": 4,
                        "completed-count": 0
                    },
                    {
                        "id": 29928724,
                        "url": "https://putnam1.basecamphq.com/todo_lists/29928724",
                        "name": "Test Twice",
                        "description": "",
                        "position": 3,
                        "completed": false,
                        "uncompleted-count": 3,
                        "completed-count": 0
                    }
                ]
            },
            "14203098": {
                "project": [
                    {
                        "company": {
                            "id": 3773718,
                            "name": "Testco Incorporated"
                        },
                        "created-on": "2018-05-19",
                        "id": 14203098,
                        "last-changed-on": "2018-08-07T02:08:51Z",
                        "name": "Test Project",
                        "start-page": "todos",
                        "url": "https://putnam1.basecamphq.com/projects/14203098"
                    }
                ],
                "lists": [
                    {
                        "id": 30026062,
                        "url": "https://putnam1.basecamphq.com/todo_lists/30026062",
                        "name": "Home Improvement",
                        "description": "",
                        "position": 2,
                        "completed": false,
                        "uncompleted-count": 4,
                        "completed-count": 0
                    },
                    {
                        "id": 29928724,
                        "url": "https://putnam1.basecamphq.com/todo_lists/29928724",
                        "name": "Test List A",
                        "description": "",
                        "position": 3,
                        "completed": false,
                        "uncompleted-count": 3,
                        "completed-count": 0
                    },
                    {
                        "id": 30041823,
                        "url": "https://putnam1.basecamphq.com/todo_lists/30041823",
                        "name": "completed list",
                        "description": "",
                        "position": 1,
                        "completed": true,
                        "uncompleted-count": 0,
                        "completed-count": 1
                    }
                ]
            }
        },
        "project-todo-lists_created": {
            "14203098": 9999999999999
        }
    }
}
