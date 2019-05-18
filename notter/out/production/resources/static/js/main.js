
function getIndex(list, id) {
    for (var i = 0; i < list.length; i++ ) {
        if (list[i].id === id) {
            return i;
        }
    }

    return -1;
}


var messageApi = Vue.resource('/message{/id}');

Vue.component('message-form', {
    props: ['messages', 'messageAttr'],
    data: function() {
        return {
            tag:'',
            text: '',
            id: ''

        }
    },
    watch: {
        messageAttr: function(newVal, oldVal) {
            this.text = newVal.text;
            this.id = newVal.id;
            this.tag=newVal.tag;
        }
    },
    template:
        '<div>' +
        '<input type="text" style="width:100px" placeholder="Write note" v-model="text" />' +
        '<input type="text"  style="width:60px" placeholder="Write tag" v-model="tag" />' +
        '<input type="button" value="Save" @click="save" />' +
        '</div>',
    methods: {
        save: function() {
            var message = { text: this.text,
                tag:this.tag};


            if (this.id) {
                messageApi.update({id: this.id}, message).then(result =>
                result.json().then(data => {
                    var index = getIndex(this.messages, data.id);
                this.messages.splice(index, 1, data);
                this.text = '';
                this.id = '';
                this.tag = '';
            })
            )
            } else {
                messageApi.save({}, message).then(result =>
                result.json().then(data => {
                    this.messages.push(data);
                this.text = '';
                this.tag = ''

            })
            )
            }
        }
    }
});

Vue.component('message-row', {
    props: ['message','tag', 'editMethod', 'messages'],
    template: '<div>' +
        '<i>{{ message.id }}<span>&nbsp&nbsp</span></i> {{ message.text }}<b><span>&nbsp&nbsp</span>{{ message.tag }}</b> ' +
        '<span style="position: absolute; right: 0">' +
        '<input type="button" value="Edit" @click="edit" />' +
        '<input type="button" value="X" @click="del" />' +
        '</span>' +
        '</div>',
    methods: {
        edit: function() {
            this.editMethod(this.message);
        },
        del: function() {
            messageApi.remove({id: this.message.id}).then(result => {
                if (result.ok) {
                this.messages.splice(this.messages.indexOf(this.message), 1)
            }
        })
        }
    }
});

Vue.component('messages-list', {
    props: ['messages'],
    data: function() {
        return {
            message: null,
            tag : null
        }
    },
    template:
        '<div style="position: relative; width: 350px;">' +
        '<message-form :messages="messages" :messageAttr="message"  />' +
        '<message-row v-for="message in messages" :key="message.id" :message="message"  :tag="tag"' +
        ':editMethod="editMethod" :messages="messages" />' +
        '</div>',
    methods: {
        editMethod: function(message,tag) {
            this.message = message;


        }
    }
});

var app = new Vue({
    el: '#app',
    template:
        '<div>' +
        '<div v-if="!profile">Log in via <a href="/login">Google</a></div>' +
        '<div v-else>' +
        '<div>{{profile.name}}&nbsp;<a href="/logout">Log out </a></div>' +
        '<messages-list :messages="messages" />' +
        '</div>' +
        '</div>',
    data: {
        messages: frontendData.messages,
        profile: frontendData.profile
    },
    created: function() {
//    messageApi.get().then(result =>
//        result.json().then(data =>
//            data.forEach(message => this.messages.push(message))
//        )
//    )
    },
});