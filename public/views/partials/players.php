<div class="active-player-indicator"></div>
<ul class="players">
	<?php for ($i = 1; $i < 3; $i++) { ?>
		<li class="player" id="player<?= $i; ?>">
			<div class="player__details">
				<div class="player__points">
					<div class="player__points-inner">
						<span></span>
						<em></em>
					</div>
				</div>
				<h3 class="player__name"></h3>
				<h4 class="player__role"></h4>
				<label class="player__hint"></label>
			</div>
		</li>
	<?php } ?>
</ul>