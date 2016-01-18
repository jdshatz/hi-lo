<ul class="players">
	<?php for ($i = 1; $i < 3; $i++) { ?>
		<li class="player<?php if ($i === 1){?> player--active<?php } ?>" id="player-<?= $i; ?>">
			<div class="player__details">
				<div class="player__points">
					<span>0</span>
					<em>points</em>
				</div>
				<h3>Player <?= $i; ?></h3>
				<h4><?= $i === 1 ? 'Dealer' : 'Guesser'; ?></h4>
			</div>
		</li>
	<?php } ?>
</ul>