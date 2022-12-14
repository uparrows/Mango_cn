const component = () => {
	return {
		jobs: [],
		paused: undefined,
		loading: false,
		toggling: false,
		ws: undefined,

		wsConnect(secure = true) {
			const url = `${secure ? 'wss' : 'ws'}://${location.host}${base_url}api/admin/mangadex/queue`;
			console.log(`Connecting to ${url}`);
			this.ws = new WebSocket(url);
			this.ws.onmessage = event => {
				const data = JSON.parse(event.data);
				this.jobs = data.jobs;
				this.paused = data.paused;
			};
			this.ws.onclose = () => {
				if (this.ws.failed)
					return this.wsConnect(false);
				alert('danger', 'Socket 连接关闭');
			};
			this.ws.onerror = () => {
				if (secure)
					return this.ws.failed = true;
				alert('danger', 'Socket连接失败');
			};
		},
		init() {
			this.wsConnect();
			this.load();
		},
		load() {
			this.loading = true;
			$.ajax({
					type: 'GET',
					url: base_url + 'api/admin/mangadex/queue',
					dataType: 'json'
				})
				.done(data => {
					if (!data.success && data.error) {
						alert('danger', `获取下载队列失败. Error: ${data.error}`);
						return;
					}
					this.jobs = data.jobs;
					this.paused = data.paused;
				})
				.fail((jqXHR, status) => {
					alert('danger', `获取下载队列失败. Error: [${jqXHR.status}] ${jqXHR.statusText}`);
				})
				.always(() => {
					this.loading = false;
				});
		},
		jobAction(action, event) {
			let url = `${base_url}api/admin/mangadex/queue/${action}`;
			if (event) {
				const id = event.currentTarget.closest('tr').id.split('-').slice(1).join('-');
				url = `${url}?${$.param({
					id: id
				})}`;
			}
			console.log(url);
			$.ajax({
					type: 'POST',
					url: url,
					dataType: 'json'
				})
				.done(data => {
					if (!data.success && data.error) {
						alert('danger', `下载队列中的 ${action} 作业失败. Error: ${data.error}`);
						return;
					}
					this.load();
				})
				.fail((jqXHR, status) => {
					alert('danger', `下载队列中的 ${action} 作业失败. Error: [${jqXHR.status}] ${jqXHR.statusText}`);
				});
		},
		toggle() {
			this.toggling = true;
			const action = this.paused ? 'resume' : 'pause';
			const url = `${base_url}api/admin/mangadex/queue/${action}`;
			$.ajax({
					type: 'POST',
					url: url,
					dataType: 'json'
				})
				.fail((jqXHR, status) => {
					alert('danger', ` ${action} 下载队列失败. Error: [${jqXHR.status}] ${jqXHR.statusText}`);
				})
				.always(() => {
					this.load();
					this.toggling = false;
				});
		},
		statusClass(status) {
			let cls = 'label ';
			switch (status) {
				case 'Pending':
					cls += 'label-pending';
					break;
				case 'Completed':
					cls += 'label-success';
					break;
				case 'Error':
					cls += 'label-danger';
					break;
				case 'MissingPages':
					cls += 'label-warning';
					break;
			}
			return cls;
		}
	};
};
