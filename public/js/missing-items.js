const component = () => {
	return {
		empty: true,
		titles: [],
		entries: [],
		loading: true,

		load() {
			this.loading = true;
			this.request('GET', `${base_url}api/admin/titles/missing`, data => {
				this.titles = data.titles;
				this.request('GET', `${base_url}api/admin/entries/missing`, data => {
					this.entries = data.entries;
					this.loading = false;
					this.empty = this.entries.length === 0 && this.titles.length === 0;
				});
			});
		},
		rm(event) {
			const rawID = event.currentTarget.closest('tr').id;
			const [type, id] = rawID.split('-');
			const url = `${base_url}api/admin/${type === 'title' ? 'titles' : 'entries'}/missing/${id}`;
			this.request('DELETE', url, () => {
				this.load();
			});
		},
		rmAll() {
			UIkit.modal.confirm('你确定吗？ 与这些项目相关的所有元数据，包括它们的标签和缩略图，都将从数据库中删除。', {
				labels: {
					ok: '是的，删除它们',
					cancel: '取消'
				}
			}).then(() => {
				this.request('DELETE', `${base_url}api/admin/titles/missing`, () => {
					this.request('DELETE', `${base_url}api/admin/entries/missing`, () => {
						this.load();
					});
				});
			});
		},
		request(method, url, cb) {
			console.log(url);
			$.ajax({
					type: method,
					url: url,
					contentType: 'application/json'
				})
				.done(data => {
					if (data.error) {
						alert('danger', `未能 ${method} ${url}. Error: ${data.error}`);
						return;
					}
					if (cb) cb(data);
				})
				.fail((jqXHR, status) => {
					alert('danger', `未能 ${method} ${url}. Error: [${jqXHR.status}] ${jqXHR.statusText}`);
				});
		}
	};
};
