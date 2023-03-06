import { useEffect, useState } from 'react';
import * as C from './App.styles';
import logoImage from './assets/devmemory_logo.png';
import RestartIcon from './svgs/restart.svg';
import { Button } from './components/Button';
import { InfoItem } from './components/InfoItem';
import { GridItemType } from './types/GridItemType';
import { items } from './data/items';
import { GridItem } from './components/GridItem';
import { formatTimeElapsed } from './helpers/formatTimeElasped';

const App = () => {
	const [playing, setPlaying] = useState<boolean>(false);
	const [timeElapsed, setTimeElapsed] = useState<number>(0);
	const [moveCount, setMoveCount] = useState<number>(0);
	const [showCount, setShowCount] = useState<number>(0);
	const [gridItems, setGridItems] = useState<GridItemType[]>([]);

	useEffect(() => resetAndCreateGrid(), []);

	useEffect(() => {
		const timer = setInterval(() => {
			if (playing) setTimeElapsed(timeElapsed + 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [playing, timeElapsed]);

	// verify if opened are equal
	useEffect(() => {
		if (showCount === 2) {
			let opened = gridItems.filter((item) => item.shown === true);
			if (opened.length === 2) {
				// 1 - if equal, make permanent
				let tmpGrid = [...gridItems];
				if (opened[0].item === opened[1].item) {
					for (let i in tmpGrid) {
						if (tmpGrid[i].shown === true) {
							tmpGrid[i].permanentShown = true;
							tmpGrid[i].shown = false;
						}
					}
					setGridItems(tmpGrid);
					setShowCount(0);
				} else {
					// 2 - if not equal, close all
					setTimeout(() => {
						let tmpGrid = [...gridItems];
						for (let i in tmpGrid) {
							tmpGrid[i].shown = false;
						}
						setGridItems(tmpGrid);
						setShowCount(0);
					}, 1000);
				}

				setMoveCount((moveCount) => moveCount + 1);
			}
		}
	}, [showCount, gridItems]);

	// verify if game is over
	useEffect(() => {
		if (
			moveCount > 0 &&
			gridItems.every((item) => item.permanentShown === true)
		) {
			setPlaying(false);
		}
	}, [moveCount, gridItems]);

	const resetAndCreateGrid = () => {
		// step 1 - reset game
		setTimeElapsed(0);
		setMoveCount(0);
		setShowCount(0);

		// step 2 - creat grid
		// 2.1 - create empty grid
		let tmpGrid: GridItemType[] = [];
		for (let i = 0; i < items.length * 2; i++) {
			tmpGrid.push({
				item: null,
				shown: false,
				permanentShown: false,
			});
		}

		// 2.2 - fill grid
		for (let w = 0; w < 2; w++) {
			for (let i = 0; i < items.length; i++) {
				let pos = -1;
				while (pos < 0 || tmpGrid[pos].item !== null) {
					pos = Math.floor(Math.random() * (items.length * 2));
				}
				tmpGrid[pos].item = i;
			}
		}

		// 2.3 - useState
		setGridItems(tmpGrid);

		// step 3 - start game
		setPlaying(true);
	};

	const handleItemClick = (index: number) => {
		if (playing && index !== null && showCount < 2) {
			let tmpGrid = [...gridItems];

			if (
				tmpGrid[index].permanentShown === false &&
				tmpGrid[index].shown === false
			) {
				tmpGrid[index].shown = true;
				setShowCount(showCount + 1);
			}

			setGridItems(tmpGrid);
		}
	};

	return (
		<C.Container>
			<C.Info>
				<C.LogoLink href="">
					<img src={logoImage} width="200" alt="" />
				</C.LogoLink>
				<C.InfoArea>
					<InfoItem
						label="Time"
						value={formatTimeElapsed(timeElapsed)}
					/>
					<InfoItem label="Moves" value={moveCount.toString()} />
				</C.InfoArea>
				<Button
					label="Restart"
					icon={RestartIcon}
					onClick={resetAndCreateGrid}
				/>
			</C.Info>
			<C.GridArea>
				<C.Grid>
					{gridItems.map((item, index) => (
						<GridItem
							key={index}
							item={item}
							onClick={() => handleItemClick(index)}
						/>
					))}
				</C.Grid>
			</C.GridArea>
		</C.Container>
	);
};

export default App;
